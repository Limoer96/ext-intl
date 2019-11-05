import i18n from '@/i18n';
import React, { Component } from 'react'
import styles from './style.module.scss'
import { Modal, Form, Input } from 'antd'
import { message } from 'antd'
interface IProps {
  remark?: string
  showModal: boolean
  saveRemark: (remark) => void
  cancel: () => void
}
interface IState {
  remark: string
}
export default class Index extends Component<IProps, IState> {
  state: IState = {
    remark: ''
  }
  componentDidMount() {}
  componentWillReceiveProps(newProps) {
    const { remark } = newProps
    this.setState({
      remark
    })
  }
  saveRemark = () => {
    const { remark } = this.state
    if (remark.length > 500) {
      message.error(I18N.WwwFd1FdTestdirXxx1, 2)
      return false
    }
    this.props.saveRemark(this.state.remark)
  }
  render() {
    const { showModal } = this.props
    const { remark } = this.state
    return (
      <Modal
        visible={showModal}
        title={I18N.WwwFd1FdTestdirXxx2}
        okText={I18N.WwwFd1FdTestdirXxx3}
        cancelText={I18N.D:WwwFd1FdTestXxx4}
        onOk={this.saveRemark}
        onCancel={this.props.cancel}
      >
        <Form onSubmit={this.saveRemark}>
          <Form.Item label={I18N.D:WwwFd1FdTestXxx5} className={styles.formItem}>
            <Input.TextArea
              placeholder={I18N.D:WwwFd1FdTestXxx6}
              autosize={{ minRows: 4 }}
              value={remark}
              onChange={event => {
                this.setState({ remark: event.target.value })
              }}
              className={styles.textArea}
            />
          </Form.Item>
        </Form>
        <p>{ I18N.D:WwwFd1FdTestXxx7 }</p>
      </Modal>
    )
  }
}
