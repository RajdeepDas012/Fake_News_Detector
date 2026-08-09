import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-surface-container-lowest border-t border-outline-variant w-full mt-auto py-stack-lg px-margin-mobile md:px-margin-desktop">
      <div className="max-w-container-max mx-auto flex flex-col items-start gap-1">
        <span className="text-headline-md font-headline-md font-extrabold text-primary block">
          TruthCheck AI
        </span>
        <p className="text-body-md font-body-md text-on-surface-variant">
          © 2026 TruthCheck AI. Fighting misinformation with AI
        </p>
      </div>
    </footer>
  );
}
