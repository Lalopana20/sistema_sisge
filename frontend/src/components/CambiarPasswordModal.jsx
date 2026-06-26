import { Form, Input } from 'antd'
import api from '../services/api'
import notify from '../utils/notify'
import FormModal from './FormModal'

export default function CambiarPasswordModal({ open, onClose }) {
  const [form] = Form.useForm()

  const onFinish = async ({ password_actual, password_nueva }) => {
    await api.patch('/auth/password', { password_actual, password_nueva })
    notify.success('Contraseña actualizada', 'Tu sesión sigue activa con la nueva clave')
    form.resetFields()
  }

  return (
    <FormModal
      title="Cambiar contraseña"
      open={open}
      onCancel={() => { form.resetFields(); onClose() }}
      onFinish={onFinish}
      form={form}
    >
      <Form.Item name="password_actual" label="Contraseña actual"
                 rules={[{ required: true, message: 'Obligatoria' }]}>
        <Input.Password />
      </Form.Item>
      <Form.Item name="password_nueva" label="Nueva contraseña"
                 rules={[
                   { required: true, message: 'Obligatoria' },
                   { min: 6, message: 'Mínimo 6 caracteres' },
                 ]}>
        <Input.Password />
      </Form.Item>
      <Form.Item
        name="confirmar"
        label="Confirmar nueva contraseña"
        dependencies={['password_nueva']}
        rules={[
          { required: true, message: 'Confirma la contraseña' },
          ({ getFieldValue }) => ({
            validator(_, value) {
              if (!value || getFieldValue('password_nueva') === value) return Promise.resolve()
              return Promise.reject(new Error('Las contraseñas no coinciden'))
            },
          }),
        ]}
      >
        <Input.Password />
      </Form.Item>
    </FormModal>
  )
}
