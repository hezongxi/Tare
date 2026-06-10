import { BrowserView } from 'electron'

/**
 * 将页面 DOM 序列化为 AI 可理解的格式
 * 为每个可交互元素分配 data-ai-ref 属性，并输出 [ref=N] 标记
 */
export async function serializePage(view: BrowserView): Promise<string> {
  try {
    const result = await view.webContents.executeJavaScript(`
      (function() {
        // 清除旧的 ref 标记
        document.querySelectorAll('[data-ai-ref]').forEach(el => {
          el.removeAttribute('data-ai-ref');
        });

        const interactiveElements = [];
        let refCount = 0;

        // 选择所有可交互元素
        const selectors = 'a, button, input, textarea, select, [role="button"], [role="link"], [role="tab"], [onclick], [tabindex]';
        const elements = document.querySelectorAll(selectors);

        elements.forEach(el => {
          const rect = el.getBoundingClientRect();
          // 只处理可见元素
          if (rect.width === 0 || rect.height === 0) return;
          if (window.getComputedStyle(el).display === 'none') return;
          if (window.getComputedStyle(el).visibility === 'hidden') return;

          refCount++;
          // 写入 DOM 属性，供 executeAction 读取
          el.setAttribute('data-ai-ref', String(refCount));

          const tag = el.tagName.toLowerCase();
          const type = el.type || '';
          const text = (el.innerText || el.value || el.placeholder || el.getAttribute('aria-label') || el.name || '').trim().substring(0, 80);
          const role = el.getAttribute('role') || '';

          let desc = '[ref=' + refCount + '] ' + tag + (type ? '[' + type + ']' : '') + ' "' + text + '"' + (role ? ' role=' + role : '');

          // 对 select 元素，输出可选项列表
          if (tag === 'select') {
            const options = [];
            el.querySelectorAll('option').forEach(opt => {
              const optText = (opt.text || opt.value || '').trim();
              if (optText && optText !== text) {
                options.push(optText);
              }
            });
            if (options.length > 0) {
              desc += ' options: [' + options.join(', ') + ']';
            }
          }

          interactiveElements.push(desc);
        });

        return JSON.stringify({
          url: window.location.href,
          title: document.title,
          elements: interactiveElements.join('\\n'),
          elementCount: refCount
        });
      })()
    `)

    const data = JSON.parse(result)
    return `URL: ${data.url}\nTitle: ${data.title}\n\n可交互元素 (${data.elementCount}):\n${data.elements}`
  } catch (err) {
    return '无法序列化页面内容'
  }
}

/**
 * 安全转义字符串用于 JS 字符串拼接
 */
function escapeJsString(str: string): string {
  return (str || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r')
}

/**
 * 执行浏览器动作
 */
export async function executeAction(
  view: BrowserView,
  action: string,
  params: Record<string, any>
): Promise<string> {
  try {
    switch (action) {
      case 'click': {
        const ref = params.ref ? String(params.ref) : ''
        const text = escapeJsString(params.text || '')

        const result = await view.webContents.executeJavaScript(`
          (function() {
            let target = null;

            // 优先通过 data-ai-ref 属性匹配
            ${ref ? `target = document.querySelector('[data-ai-ref="${ref}"]');` : ''}

            // 回退：通过文本/placeholder/aria-label 匹配
            if (!target) {
              const allEls = document.querySelectorAll('a, button, input, textarea, select, [role="button"], [role="link"], [role="tab"], [data-ai-ref]');
              for (const el of allEls) {
                const elText = (el.innerText || el.value || el.placeholder || el.getAttribute('aria-label') || '').trim();
                if (elText.includes("${text}")) {
                  target = el;
                  break;
                }
              }
            }

            if (target) {
              target.click();
              const name = (target.innerText || target.value || target.placeholder || 'element').trim().substring(0, 50);
              return 'clicked: ' + name;
            }
            return 'element not found (ref=${ref}, text="${text}")';
          })()
        `)
        return result
      }

      case 'type': {
        const ref = params.ref ? String(params.ref) : ''
        const field = escapeJsString((params.field || '').toLowerCase())
        const text = escapeJsString(params.text || '')

        const result = await view.webContents.executeJavaScript(`
          (function() {
            let target = null;

            // 优先通过 data-ai-ref 属性匹配
            ${ref ? `target = document.querySelector('[data-ai-ref="${ref}"]');` : ''}

            // 回退：通过 placeholder/aria-label/name 匹配
            if (!target) {
              const allEls = document.querySelectorAll('input, textarea, [contenteditable="true"]');
              for (const el of allEls) {
                const label = (el.placeholder || el.getAttribute('aria-label') || el.name || el.id || '').toLowerCase();
                if (label.includes('${field}')) {
                  target = el;
                  break;
                }
              }
            }

            if (target) {
              // 如果目标是 select 元素，自动转为 select 行为
              if (target.tagName === 'SELECT') {
                const options = target.options;
                let found = false;
                for (let i = 0; i < options.length; i++) {
                  if (options[i].text.includes("${text}") || options[i].value.includes("${text}")) {
                    target.selectedIndex = i;
                    found = true;
                    break;
                  }
                }
                target.dispatchEvent(new Event('change', { bubbles: true }));
                if (found) {
                  return 'selected: ' + "${text}" + ' in ' + (target.name || target.id || 'select');
                }
                return 'option not found: ' + "${text}" + ' in ' + (target.name || target.id || 'select');
              }

              target.focus();
              // 使用原生 setter 确保 React/Vue 等框架能捕获值变化
              const nativeSetter = Object.getOwnPropertyDescriptor(
                target.tagName === 'TEXTAREA' ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype,
                'value'
              )?.set;
              if (nativeSetter) {
                nativeSetter.call(target, "${text}");
              } else {
                target.value = "${text}";
              }
              target.dispatchEvent(new Event('input', { bubbles: true }));
              target.dispatchEvent(new Event('change', { bubbles: true }));
              // 额外触发键盘事件，兼容更多框架
              target.dispatchEvent(new KeyboardEvent('keydown', { bubbles: true }));
              target.dispatchEvent(new KeyboardEvent('keyup', { bubbles: true }));
              const name = (target.placeholder || target.name || target.id || 'field').trim().substring(0, 50);
              return 'typed into: ' + name;
            }
            return 'input field not found (ref=${ref}, field="${field}")';
          })()
        `)
        return result
      }

      case 'select': {
        const ref = params.ref ? String(params.ref) : ''
        const text = escapeJsString(params.text || '')

        const result = await view.webContents.executeJavaScript(`
          (function() {
            let target = null;

            // 优先通过 data-ai-ref 属性匹配
            ${ref ? `target = document.querySelector('[data-ai-ref="${ref}"]');` : ''}

            // 回退：通过 name/id/aria-label 匹配 select 元素
            if (!target || target.tagName !== 'SELECT') {
              const allSelects = document.querySelectorAll('select');
              for (const sel of allSelects) {
                const label = (sel.name || sel.id || sel.getAttribute('aria-label') || '').toLowerCase();
                if (label.includes("${text}".toLowerCase()) || sel.getAttribute('data-ai-ref') === '${ref}') {
                  target = sel;
                  break;
                }
              }
            }

            if (target && target.tagName === 'SELECT') {
              const options = target.options;
              let found = false;
              for (let i = 0; i < options.length; i++) {
                const optText = (options[i].text || '').trim();
                const optVal = (options[i].value || '').trim();
                if (optText === "${text}" || optVal === "${text}" || optText.includes("${text}") || optVal.includes("${text}")) {
                  target.selectedIndex = i;
                  found = true;
                  break;
                }
              }
              target.dispatchEvent(new Event('change', { bubbles: true }));
              if (found) {
                return 'selected: ' + "${text}" + ' in ' + (target.name || target.id || 'select');
              }
              const availableOptions = [];
              for (let i = 0; i < options.length; i++) {
                availableOptions.push(options[i].text.trim());
              }
              return 'option not found: ' + "${text}" + '. Available: [' + availableOptions.join(', ') + ']';
            }
            return 'select element not found (ref=${ref})';
          })()
        `)
        return result
      }

      case 'navigate': {
        await view.webContents.loadURL(params.url)
        return `navigated to: ${params.url}`
      }

      case 'scroll': {
        await view.webContents.executeJavaScript(`
          window.scrollBy(0, ${params.direction === 'up' ? -500 : 500})
        `)
        return `scrolled ${params.direction || 'down'}`
      }

      case 'wait': {
        await new Promise(resolve => setTimeout(resolve, (params.seconds || 1) * 1000))
        return `waited ${params.seconds || 1} seconds`
      }

      case 'extract': {
        const selector = escapeJsString(params.selector || 'body')
        const content = await view.webContents.executeJavaScript(`
          (function() {
            const el = document.querySelector('${selector}');
            return el ? el.innerText.substring(0, 2000) : 'not found';
          })()
        `)
        return content
      }

      case 'done': {
        return params.summary || '任务完成'
      }

      default:
        return `unknown action: ${action}`
    }
  } catch (err: any) {
    return `error: ${err.message}`
  }
}
