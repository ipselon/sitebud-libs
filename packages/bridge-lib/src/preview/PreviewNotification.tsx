import React, {CSSProperties} from 'react';

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
    const {message, severity = 'neutral'} = props;
    return (
        <div
            style={{
                position: 'fixed',
                top: '1em',
                left: '1em',
                padding: '1px',
                display: 'flex',
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
                    ...styles[severity]
                }}
            >
                {message}
            </div>
        </div>
    )
}