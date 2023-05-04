import React, {useEffect, useState, useRef} from 'react';

interface PreviewModeMarkProps {
}

export function PreviewModeMark(props: PreviewModeMarkProps) {
    const timerRef = useRef<number>();
    const [showNotification, setShowNotification] = useState<boolean>(false);

    useEffect(() => {
        if (!timerRef.current) {
            // @ts-ignore
            timerRef.current = setTimeout(() => {
                setShowNotification(true);
            }, 500);
        }
        return () => {
            if (timerRef.current) {
                clearTimeout(timerRef.current);
            }
            timerRef.current = undefined;
        };
    }, []);

    if (showNotification) {
        return (
            <div
                style={{
                    position: 'fixed',
                    zIndex: 9999,
                    bottom: '1em',
                    right: '1em',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'start',
                    borderRadius: '4px',
                    overflow: 'hidden',
                    padding: '0.5em 1em',
                    border: '1px solid #94a3b8',
                    backgroundColor: '#e2e8f0',
                    color: '#64748b',
                    fontSize: '12px'
                }}
                title="Click to exit the preview mode"
            >
               <a href="/api/clear-preview">Exit Preview Mode</a>
            </div>
        )
    }
    return null;
}