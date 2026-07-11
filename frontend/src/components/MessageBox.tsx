import type { ReactNode } from 'react'

type MessageBoxProps = {
    type: 'success' | 'error' | 'info'
    children: ReactNode
}

// Inline message box (success / error / info). Each type maps to the
// exact CSS class the app already used, so the look, conditional
// rendering and behavior are unchanged; it only removes repeated markup.
const CLASS_FOR_TYPE: Record<MessageBoxProps['type'], string> = {
    success: 'success-message',
    error: 'login-error',
    info: 'selected-course-note',
}

function MessageBox({ type, children }: MessageBoxProps) {
    return <p className={CLASS_FOR_TYPE[type]}>{children}</p>
}

export default MessageBox
