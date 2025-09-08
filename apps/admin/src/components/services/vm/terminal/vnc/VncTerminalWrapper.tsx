// app/services/vm/[id]/VncTerminalWrapper.tsx
'use client';

import { VncTerminalProps } from '@/components/services/vm/terminal/vnc/vnc';
import dynamic from 'next/dynamic';

// Dynamically load VncTerminal ONLY in the browser
const VncTerminal = dynamic(
    //@ts-ignore
    async () => (await import('./vnc')),
    { ssr: false }
);

export default function VncTerminalWrapper(props: VncTerminalProps) {
    //@ts-ignore
    return <VncTerminal {...props} />;
}
