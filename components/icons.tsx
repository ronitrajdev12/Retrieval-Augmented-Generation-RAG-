import React from 'react';

const Icon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  />
);

export const Lightbulb: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props}>
    <path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5" />
    <path d="M9 18h6" />
    <path d="M10 22h4" />
  </Icon>
);

export const Cog: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <path d="M12 20a8 8 0 1 0 0-16 8 8 0 0 0 0 16z" />
        <path d="M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
        <path d="M12 2v2" />
        <path d="M12 22v-2" />
        <path d="m17 20.66-1-1.73" />
        <path d="M11 10.27 7 3.34" />
        <path d="m22 12-2 0" />
        <path d="m4 12-2 0" />
        <path d="m20.66 7-1.73-1" />
        <path d="m3.34 17 1.73 1" />
    </Icon>
);

export const Beaker: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <path d="M14.5 2h-5L4 12.5a6.5 6.5 0 1 0 13 0L14.5 2z" />
        <path d="M6 14h12" />
        <path d="M6 18h12" />
    </Icon>
);

export const Briefcase: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <rect width="20" height="14" x="2" y="7" rx="2" ry="2" />
        <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </Icon>
);

// FIX: Corrected closing tag from </Ico> to </Icon>.
export const Scales: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <path d="m16 16 3-8 3 8c-.8.9-2 1-3 1-1 0-2.2-.1-3-1z" />
        <path d="m2 16 3-8 3 8c-.8.9-2 1-3 1-1 0-2.2-.1-3-1z" />
        <path d="M7 21h10" />
        <path d="M12 3v18" />
        <path d="M3 7h18" />
    </Icon>
);

export const ListChecks: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <path d="m3 17 2 2 4-4" />
        <path d="m3 7 2 2 4-4" />
        <path d="M13 6h8" />
        <path d="M13 12h8" />
        <path d="M13 18h8" />
    </Icon>
);

export const Sparkles: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <path d="m12 3-1.9 5.8-5.8 1.9 5.8 1.9L12 21l1.9-5.8 5.8-1.9-5.8-1.9Z" />
    </Icon>
);

export const Sliders: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <line x1="4" x2="4" y1="21" y2="14" />
        <line x1="4" x2="4" y1="10" y2="3" />
        <line x1="12" x2="12" y1="21" y2="12" />
        <line x1="12" x2="12" y1="8" y2="3" />
        <line x1="20" x2="20" y1="21" y2="16" />
        <line x1="20" x2="20" y1="12" y2="3" />
        <line x1="1" x2="7" y1="14" y2="14" />
        <line x1="9" x2="15" y1="8" y2="8" />
        <line x1="17" x2="23" y1="16" y2="16" />
    </Icon>
);

export const CheckCircle: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </Icon>
);

export const UploadCloudIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7" />
        <path d="M18 8V2l-4 4" />
        <path d="M16 2h2" />
    </Icon>
);

export const Search: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </Icon>
);

export const Star: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </Icon>
);

export const Brain: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
      <path d="M12 2a4.5 4.5 0 0 0-4.5 4.5c0 1.25.5 2.4 1.37 3.25" />
      <path d="M12 2a4.5 4.5 0 0 1 4.5 4.5c0 1.25-.5 2.4-1.37 3.25" />
      <path d="M12 22a4.5 4.5 0 0 0 4.5-4.5c0-1.25-.5-2.4-1.37-3.25" />
      <path d="M12 22a4.5 4.5 0 0 1-4.5-4.5c0-1.25.5-2.4 1.37 3.25" />
      <path d="M2.5 12a4.5 4.5 0 0 0 4.5 4.5c1.25 0 2.4-.5 3.25-1.37" />
      <path d="M2.5 12a4.5 4.5 0 0 1 4.5-4.5c1.25 0 2.4.5 3.25 1.37" />
      <path d="M21.5 12a4.5 4.5 0 0 1-4.5-4.5c-1.25 0-2.4.5-3.25 1.37" />
      <path d="M21.5 12a4.5 4.5 0 0 0-4.5 4.5c-1.25 0-2.4-.5-3.25-1.37" />
      <path d="M12 8.75v6.5" />
    </Icon>
);

export const SpeakerIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
        <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
    </Icon>
);

export const SpeakerMuteIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
    <Icon {...props}>
        <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
        <line x1="23" y1="9" x2="17" y2="15"></line>
        <line x1="17" y1="9" x2="23" y2="15"></line>
    </Icon>
);