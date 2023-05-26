import React, {CSSProperties, useEffect, useState, useRef} from 'react';

type NotificationSeverity = 'neutral' | 'error';

interface PreviewNotificationProps {
    severity?: NotificationSeverity;
    message: string;
}

const styles: Record<NotificationSeverity, CSSProperties> = {
    'neutral': {
        backgroundColor: '#f5f5f5',
        color: '#1e293b'
    },
    'error': {
        backgroundColor: '#b91c1c',
        color: '#ffffff'
    }
};

export function PreviewNotification(props: PreviewNotificationProps) {
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
        const {message, severity = 'neutral'} = props;
        return (
            <div
                style={{
                    zIndex: 9999,
                    position: 'fixed',
                    top: '1em',
                    left: '1em',
                    padding: '1px',
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'start',
                    backgroundColor: '#ffffff',
                    border: '1px solid #cdcdcd',
                    boxShadow: '0 1px 3px rgba(34, 25, 25, 0.4)',
                    borderRadius: '4px'
                }}
            >
                <div
                    style={{
                        width: '100%',
                        height: '100%',
                        borderRadius: '4px',
                        padding: '0.5em 1em',
                        fontSize: '12px',
                        whiteSpace: 'nowrap',
                        ...styles[severity]
                    }}
                >
                    {message}
                </div>
                {severity === 'error' && (
                    <div
                        style={{
                            width: '100%',
                            height: '100%',
                            borderRadius: '4px',
                            padding: '0.5em 1em',
                            fontSize: '12px',
                            backgroundColor: '#f5f5f5',
                            color: '#1e293b',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        <a href="/api/clear-preview">Exit Preview Mode</a>
                    </div>
                )}
            </div>
        )
    }
    return null;
}