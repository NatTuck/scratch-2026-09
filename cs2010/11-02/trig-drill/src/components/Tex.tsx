import katex from 'katex';

interface TexProps {
  tex: string;
  display?: boolean;
  className?: string;
}

/** Renders a LaTeX string. KaTeX throws on bad input, so errors fall back to text. */
export default function Tex({ tex, display = false, className }: TexProps) {
  let html: string;
  try {
    html = katex.renderToString(tex, {
      displayMode: display,
      throwOnError: false,
      strict: false,
      output: 'html',
    });
  } catch {
    html = tex;
  }
  return <span className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
