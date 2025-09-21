'use client';
import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { VncScreenHandle } from 'react-vnc';
import { width } from '@fortawesome/free-brands-svg-icons/fa11ty';

const VncScreen = dynamic(
    () => import('react-vnc').then(m => m.VncScreen),
    {
        ssr: false,
        loading: () => <div style={{ padding: 12 }}>Loading VNC…</div>,
    }
);

export default function VncTerminal({ url, vncPassword }: { url: string, vncPassword: string }) {


    return (
        <div className="h-full w-full">
            <VncScreen
                url={url}
                rfbOptions={{ credentials: { password: vncPassword } }}
                scaleViewport
                background="#000000"
                style={{ width: '100%', height: '100%' }}
            />
        </div>
    );
}