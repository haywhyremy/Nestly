import { Sheet as ModalSheet } from 'react-modal-sheet'

export function Sheet({
  isOpen,
  onClose,
  title,
  children,
  footer,
  snapPoints = [0.65]
}) {
  return (
    <ModalSheet
      isOpen={isOpen}
      onClose={onClose}
      snapPoints={snapPoints}
      initialSnap={0}
    >
      <ModalSheet.Container
        role="dialog"
        aria-modal="true"
        className="bg-surface-raised rounded-t-3xl shadow-none"
        style={{
          boxShadow: '0 -4px 16px rgba(31, 27, 22, 0.08)'
        }}
      >
        <ModalSheet.Header>
          <div className="w-10 h-1 rounded-full bg-ink-tertiary mx-auto mt-3" />
          {title && (
            <h2 className="text-xl font-semibold text-ink-primary px-6 pt-4">
              {title}
            </h2>
          )}
        </ModalSheet.Header>

        <ModalSheet.Content className="px-6 pb-6 overflow-y-auto">
          {children}
        </ModalSheet.Content>

        {footer && (
          <div className="px-6 pb-6 pt-2 bg-surface-raised border-t border-surface-sunken">
            {footer}
          </div>
        )}
      </ModalSheet.Container>

      <ModalSheet.Backdrop
        onTap={onClose}
        style={{
          backgroundColor: 'rgba(31, 27, 22, 0.4)'
        }}
      />
    </ModalSheet>
  )
}

export default Sheet;
