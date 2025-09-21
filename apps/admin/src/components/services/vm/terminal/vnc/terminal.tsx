'use client';
import React, { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import type { VncScreenHandle } from 'react-vnc';

const VncScreen = dynamic(
    () => import('react-vnc').then(m => m.VncScreen),
    {
        ssr: false,
        loading: () => <div style={{ padding: 12 }}>Loading VNC…</div>,
    }
);

export default function VncTerminal({ url, vncPassword }: { url: string, vncPassword: string }) {


    return (
        <div>
            <VncScreen
                url={url}
                rfbOptions={{ credentials: { password: vncPassword } }}
                scaleViewport
                background="#000000"
                style={{ width: '75vw', height: '75vh' }}
            />
        </div>
    );
}