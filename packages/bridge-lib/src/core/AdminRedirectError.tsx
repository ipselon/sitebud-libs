import React, {CSSProperties} from 'react';

const wrapperStyle: CSSProperties = {
    fontFamily: "'Courier New', Courier, monospace",
    position: 'fixed',
    top: '50%',
    left: '50%',
    width: '300px',
    height: '300px',
    marginTop: '-150px',
    marginLeft: '-150px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'start',
    alignItems: 'center',
};

const messageBoxStyle:CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'start',
    alignItems: 'center',
    backgroundColor: '#e2e8f0',
    color: '#64748b',
    borderRadius: '5px',
    padding: '20px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    marginBottom: '2em',
    letterSpacing: '0.1px'
};

const textStyle: CSSProperties = {
    textAlign: 'center',
    marginBottom: '1em'
};

const linkStyle: CSSProperties = {
    textAlign: 'center',
    textDecoration: 'underline',
    color: '#3b82f6'
};

interface AdminRedirectErrorProps {
    url: string;
}

export function AdminRedirectError({url}: AdminRedirectErrorProps) {
    return (
        <div style={wrapperStyle}>
            <div style={messageBoxStyle}>
                <div style={textStyle}>
                    Hey there! It looks like this is the initial deployment, and a few more steps are needed to get everything ready.
                </div>
                <div style={{textAlign: 'center'}}>
                    Follow the instructions below to set up your own deployment.
                </div>
            </div>
            <div style={linkStyle}>
                <a href={url} target="_blank">Read Instructions</a>
            </div>
        </div>
    );
}
