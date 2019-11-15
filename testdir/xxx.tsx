import React, { Component } from 'react'
import { namespace, ParamWithCheck } from '@/models/user-manage/user-added'
import RegistForm from './regist'
import { connect } from 'react-redux'
import { IDispatch } from '@/models/connect'
import styles from './style.module.scss'
import { Modal, Form, Input } from 'antd'
import { withRouter, RouteComponentProps } from 'react-router'

interface UserAddedProps extends IDispatch, RouteComponentProps {
  addressData?: any
  phone: ParamWithCheck
}
interface UserAddedState {
  visible: boolean
  btnDisabled: boolean
}
class UserAdded extends Component<UserAddedProps, UserAddedState> {
  state: UserAddedState
  constructor(props: UserAddedProps) {
    super(props)
    this.state = {
      visible: true,
      btnDisabled: !this.isValidPhone(props.phone.value)
    }
  }
  checkIfRegisted = () => {
    const {
      phone: { value }
    } = this.props
    this.props.dispatch({
      type: `${namespace}/queryUserProfile`,
      payload: {
        mobile: value
      }
    })
    // 把获取位置信息放在检测电话号码后在获取
    this.props.dispatch({
      type: `${namespace}/getAddressLists`
    })
    // 获取品牌列表信息
    this.props.dispatch({
      type: `${namespace}/queryCategoryList`
    })
    // 暂时不请求当前位置信息
    // this.props.dispatch({
    //   type: `${namespace}/getCurrentAddress`
    // })
    this.setState({ visible: false })
  }
  handleCancel = () => {
    // 清除用户输入数据
    this.props.dispatch({
      type: `${namespace}/clearInputData`
    })
    this.props.history.goBack()
  }
  isValidPhone = (phone: number | string) => phone && /^\d{11}$/.test(String(phone))
  checkValidatePhone = (value: string | number, errorMsg) => {
    if (this.isValidPhone(value)) {
      this.setState({ btnDisabled: false })
      return {
        validateStatus: 'success',
        errorMsg: null
      }
    }
    this.setState({ btnDisabled: true })
    return {
      validateStatus: 'error',
      errorMsg
    }
  }
  handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    this.props.dispatch({
      type: `${namespace}/setState`,
      payload: {
        phone: {
          value,
          ...this.checkValidatePhone(value,I18N.WwwFd1FdTestdirXxx1)
        }
      }
    })
  }
  render() {
    const { visible, btnDisabled } = this.state
    const { phone } = this.props
    return (
      <div className={styles.container}>
        <RegistForm history={this.props.history} />
        <Modal
          title={I18N.WwwFd1FdTestdirXxx2}
          visible={visible}
          cancelText={I18N.WwwFd1FdTestdirXxx3}
          okButtonProps={{ disabled: btnDisabled }}
          okText={I18N.WwwFd1FdTestdirXxx4}
          maskClosable={false}
          onOk={this.checkIfRegisted}
          onCancel={this.handleCancel}
          className={styles.modal}
        >
          <Form labelCol={{ span: 4 }} wrapperCol={{ span: 20 }}>
            <Form.Item
              validateStatus={phone.validateStatus}
              help={phone.errorMsg}
              label={
                <span>
                  <span className={styles.requiredPrefix}>*</span>{ I18N.WwwFd1FdTestdirXxx5 }</span>
              }
            >
              <Input value={phone.value} onChange={this.handlePhoneChange} />
            </Form.Item>
          </Form>
        </Modal>
      </div>
    )
  }
}

const mapStateToProps = models => ({
  ...models[namespace]
})

export default connect(mapStateToProps)(withRouter(UserAdded))
