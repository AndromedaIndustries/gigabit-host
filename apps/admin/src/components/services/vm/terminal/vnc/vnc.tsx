'use client';
import React, { useRef } from 'react';
import { VncScreen, VncScreenHandle } from 'react-vnc';

export type VncTerminalProps = {
    node: string;
    vm_id: string;
    host: string;
    port: string;
    token: string;
    password: string;
};

export default function VncTerminal(props: VncTerminalProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    // Make sure we're in the browser and ref is ready
    if (!canvasRef.current) {
        console.warn('VNC canvas not found yet');
        return;
    }

    const encodedTicket = encodeURIComponent(props.token);
    const websocketUrl = `wss://${props.host}/api2/json/nodes/${props.node}/qemu/${props.vm_id}/vncwebsocket?port=${props.port}&vncticket=${encodedTicket}`;

    const ref = useRef<VncScreenHandle>(null);

    return (
        <div>
            <VncScreen
                url={websocketUrl}
                scaleViewport
                background="#000000"
                style={{
                    width: '75vw',
                    height: '75vh',
                }}
                ref={ref}
            />
        </div>
    );
}
