import { useState } from 'react'
import { Modal, Form, Alert } from 'antd'

export default function FormModal({
  title,
  open,
  onCancel,
  onFinish,
  okText = 'Guardar',
  width = 480,
  children,
  form,
  loading: externalLoading,
  ...rest
}) {
  const [internalLoading, setInternalLoading] = useState(false)
  const [error, setError] = useState(null)
  const loading = externalLoading || internalLoading

  const handleFinish = async (values) => {
    setInternalLoading(true)
    setError(null)
    try {
      await onFinish(values)
      onCancel()
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || err || 'Error al procesar'
      setError(msg)
    } finally {
      setInternalLoading(false)
    }
  }

  return (
    <Modal
      title={title}
      open={open}
      onCancel={onCancel}
      onOk={() => form?.submit()}
      okText={okText}
      confirmLoading={loading}
      width={width}
      destroyOnClose
      {...rest}
    >
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          closable
          onClose={() => setError(null)}
          style={{ marginBottom: 16 }}
        />
      )}
      <Form form={form} layout="vertical" onFinish={handleFinish} style={{ marginTop: 16 }}>
        {children}
      </Form>
    </Modal>
  )
}
