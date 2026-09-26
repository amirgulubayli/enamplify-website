import {esc} from './components.mjs';

// A deliberately small, safe editorial Markdown subset: headings, paragraphs,
// links, emphasis, lists, quotations and fenced code. Raw HTML is never executed.
export function inline(text) {
  const tokens=[];
  const stash=html=>`\u0000${tokens.push(html)-1}\u0000`;
  text=text.replace(/`([^`]+)`/g,(_,code)=>stash(`<code>${esc(code)}</code>`));
  text=text.replace(/\[([^\]]+)\]\(([^\s)]+)\)/g,(_,label,url)=>{
    if(!/^(https?:\/\/|\/(?!\/)|#[a-zA-Z0-9_-])/.test(url))throw new Error(`Unsupported link target: ${url}`);
    const external=/^https?:/.test(url);
    return stash(`<a href="${esc(url)}"${external?' target="_blank" rel="noopener noreferrer"':''}>${esc(label)}</a>`);
  });
  text=esc(text).replace(/\*\*([^*]+)\*\*/g,'<strong>$1</strong>').replace(/\*([^*]+)\*/g,'<em>$1</em>');
  return text.replace(/\u0000(\d+)\u0000/g,(_,index)=>tokens[Number(index)]);
}
export function renderMarkdown(markdown) {
 const lines=markdown.replace(/\r\n?/g,'\n').split('\n'),out=[];
 let i=0;
 while(i<lines.length){
  let line=lines[i];if(!line.trim()){i++;continue;}
  if(/^#\s/.test(line))throw new Error('Article H1 belongs in metadata. Use ## for sections.');
  if(/^\|/.test(line))throw new Error('Markdown tables are not supported. Use prose or a numbered list.');
  if(/^```/.test(line)){const code=[];i++;while(i<lines.length&&!/^```/.test(lines[i]))code.push(lines[i++]);if(i===lines.length)throw new Error('Unclosed code fence');i++;out.push(`<pre><code>${esc(code.join('\n'))}</code></pre>`);continue;}
  const heading=line.match(/^(#{2,4})\s+(.+)$/);if(heading){out.push(`<h${heading[1].length}>${inline(heading[2])}</h${heading[1].length}>`);i++;continue;}
  if(/^>\s?/.test(line)){const q=[];while(i<lines.length&&/^>\s?/.test(lines[i]))q.push(lines[i++].replace(/^>\s?/,''));out.push(`<blockquote><p>${inline(q.join(' '))}</p></blockquote>`);continue;}
  if(/^(?:[-*]|\d+\.)\s+/.test(line)){const ordered=/^\d/.test(line),items=[];while(i<lines.length&&/^(?:[-*]|\d+\.)\s+/.test(lines[i]))items.push(`<li>${inline(lines[i++].replace(/^(?:[-*]|\d+\.)\s+/,''))}</li>`);out.push(`<${ordered?'ol':'ul'}>${items.join('')}</${ordered?'ol':'ul'}>`);continue;}
  const paragraph=[];while(i<lines.length&&lines[i].trim()&&!/^(?:#{1,4}\s|>\s?|```|[-*]\s|\d+\.\s)/.test(lines[i]))paragraph.push(lines[i++]);
  if(!paragraph.length)throw new Error(`Unsupported Markdown near line ${i+1}`);
  out.push(`<p>${inline(paragraph.join(' '))}</p>`);
 }
 return out.join('\n');
}
