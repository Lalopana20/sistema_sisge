import { Component } from 'react'
import { Button, Result } from 'antd'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <Result
          status="error"
          title="Algo salió mal"
          subTitle={this.state.error.message}
          extra={
            <Button type="primary" onClick={() => { this.setState({ error: null }); window.location.reload() }}>
              Recargar página
            </Button>
          }
        />
      )
    }
    return this.props.children
  }
}
