'use client';
export default function ReadOnlyStyles() {
  return (
    <style
      suppressHydrationWarning
      dangerouslySetInnerHTML={{
        __html: `
      body[data-readonly="true"] .allow-interact { pointer-events: auto !important; opacity: 1 !important; }
      body[data-readonly="true"] button,
      body[data-readonly="true"] [role="button"],
      body[data-readonly="true"] input,
      body[data-readonly="true"] select,
      body[data-readonly="true"] textarea {
        pointer-events: none !important;
        opacity: 0.6;
      }
      body[data-readonly="true"] .MuiButton-root,
      body[data-readonly="true"] .MuiIconButton-root {
        pointer-events: none !important;
      }
    `,
      }}
    />
  );
}
