import { message, notification, Modal } from 'antd'
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
  QuestionCircleOutlined,
} from '@ant-design/icons'
import { createElement } from 'react'

const configBase = {
  placement: 'topRight',
  duration: 4,
}

/** Notificación toast en esquina superior derecha */
export const notify = {
  success(titulo, descripcion) {
    notification.success({
      ...configBase,
      message: titulo,
      description: descripcion,
      icon: createElement(CheckCircleOutlined, { style: { color: '#52c41a' } }),
    })
  },

  error(titulo, descripcion) {
    notification.error({
      ...configBase,
      message: titulo,
      description: descripcion,
      duration: 6,
      icon: createElement(CloseCircleOutlined, { style: { color: '#ff4d4f' } }),
    })
  },

  warning(titulo, descripcion) {
    notification.warning({
      ...configBase,
      message: titulo,
      description: descripcion,
      icon: createElement(ExclamationCircleOutlined, { style: { color: '#faad14' } }),
    })
  },

  info(titulo, descripcion) {
    notification.info({
      ...configBase,
      message: titulo,
      description: descripcion,
      icon: createElement(InfoCircleOutlined, { style: { color: '#1890ff' } }),
    })
  },

  /**
   * Diálogo de confirmación — devuelve Promise<boolean>
   * @example const ok = await notify.confirm({ title: '¿Eliminar?', content: '...' })
   */
  confirm({
    title = '¿Confirmar acción?',
    content = '¿Deseas continuar?',
    okText = 'Sí, continuar',
    cancelText = 'Cancelar',
    tipo = 'confirm',
  }) {
    const iconMap = {
      confirm: createElement(QuestionCircleOutlined),
      warning: createElement(ExclamationCircleOutlined, { style: { color: '#faad14' } }),
      danger:  createElement(ExclamationCircleOutlined, { style: { color: '#ff4d4f' } }),
    }

    return new Promise((resolve) => {
      Modal.confirm({
        title,
        content,
        okText,
        cancelText,
        icon: iconMap[tipo] || iconMap.confirm,
        okButtonProps: tipo === 'danger' ? { danger: true } : {},
        centered: true,
        onOk: () => resolve(true),
        onCancel: () => resolve(false),
      })
    })
  },

  /** Mensaje breve centrado (guardar, cargar) */
  msg: {
    success: (text) => message.success(text),
    error:   (text) => message.error(text),
    warning: (text) => message.warning(text),
    info:    (text) => message.info(text),
    loading: (text, duration = 0) => message.loading(text, duration),
  },
}

export default notify
