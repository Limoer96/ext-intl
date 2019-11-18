import React, { Fragment } from 'react'

import { Form, Input, Cascader, Button, Radio, DatePicker, Select, message } from 'antd'
import moment from 'moment'
import { IDispatch } from '@/models/connect'
import styles from './style.module.scss'
import OutBoundRemarkModal from './remake-modal'
import { namespace, UserAddedState } from '@/models/user-manage/user-added'
import { connect } from 'react-redux'
import { History } from 'history'

const Option = Select.Option
interface RegistProps extends IDispatch, Partial<UserAddedState> {
  history: History<any>
}

interface ValidateOptions {
  required?: boolean
  length?: number
  custom?: (value: any) => boolean
}

function checkValidate(value: any, options: ValidateOptions, errorMsg) {
  const { required, length, custom } = options
  if (required && !value) {
    return {
      value,
      validateStatus: 'error',
      errorMsg
    }
  }
  if (typeof length === 'number' && length > 0 && length !== value.length) {
    return {
      value,
      validateStatus: 'error',
      errorMsg
    }
  }
  if (typeof custom === 'function' && !custom(value)) {
    return {
      value,
      validateStatus: 'error',
      errorMsg
    }
  }
  return {
    value,
    validateStatus: '',
    errorMsg: ''
  }
}

class RegistrationForm extends React.Component<RegistProps> {
  // 保存用户信息
  handleSubmit = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()
    const { name, buyTime, vinCode, brand } = this.props
    const checkedList = [
      { key: 'name', value: name.value, errMsg: '请输入姓名' },
      { key: 'buyTime', value: buyTime.value, errMsg: '请输入购车时间' },
      { key: 'vinCode', value: vinCode.value, errMsg: '请填写VIN号' },
      { key: 'brand', value: brand.value, errMsg: '请填写产品品牌' }
    ]
    const checkedResult = {}
    checkedList.forEach(item => {
      const result = checkValidate(item.value, { required: true }, item.errMsg)
      if (result.validateStatus) {
        checkedResult[item.key] = { ...result }
      }
    })
    // 校验不通过
    if (Object.keys(checkedResult).length > 0) {
      this.props.dispatch({
        type: `${namespace}/setState`,
        payload: checkedResult
      })
      return
    }
    // 保存用户信息
    this.props.dispatch({
      type: `${namespace}/saveUserProfile`,
      callback: () => {
        message.success('新增用户成功！', 1)
        this.props.history.goBack()
      }
    })
  }
  checkExistVinCode = () => {
    this.props.dispatch({
      type: `${namespace}/checkVinCode`
    })
  }
  handleCommentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    this.props.dispatch({
      type: `${namespace}/setState`,
      payload: {
        comment: value
      }
    })
  }
  handleInputChange = (key: string, value: any, check: boolean = false, errorMsg?: string) => {
    if (check) {
      this.props.dispatch({
        type: `${namespace}/setState`,
        payload: {
          [key]: {
            ...checkValidate(value, { required: true }, errorMsg)
          }
        }
      })
    } else {
      this.props.dispatch({
        type: `${namespace}/setState`,
        payload: {
          [key]: value
        }
      })
    }
  }
  goBack = () => {
    this.props.dispatch({
      type: `${namespace}/clearInputData`
    })
    this.props.history.goBack()
  }
  // todo: 需要额外的字段
  findBrandById = (id: string | number) => {
    const { categoryList } = this.props
    for (const item of categoryList) {
      if (item.sellerBrandId === id) {
        return item
      }
    }
    return null
  }
  handleBrandChange = (value: any, errorMsg?: string) => {
    const item = this.findBrandById(value)
    const needFillInfo = item ? item.isChecked : false // 更新是否需要检测车架号
    this.props.dispatch({
      type: `${namespace}/setState`,
      payload: {
        brand: {
          ...checkValidate(value, { required: true }, errorMsg)
        },
        needFillInfo,
        vinCode: {
          value: '',
          validateStatus: '',
          errorMsg: ''
        },
        vehicleType: '',
        motorCode: '',
        manufactureDate: '',
        carInfoOrigin: null
      }
    })
  }
  // 检测输入框是否disabled
  checkFieldDisable = (key: string) => {
    // 初始状况下，根据是否需要填充字段来判断
    // 如果没有请求到值，则disabled=false
    const { needFillInfo, carInfoOrigin, brand } = this.props
    // 未选择品牌之前，全部都可用
    if (!brand.value) {
      return false
    }
    if (!carInfoOrigin) {
      return needFillInfo
    } else {
      return !!carInfoOrigin[key]
    }
  }
  render() {
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 }
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 16 }
      }
    }
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0
        },
        sm: {
          span: 16,
          offset: 8
        }
      }
    }
    function disableDate(current) {
      return current && current > moment().endOf('day')
    }
    const {
      name,
      birthday,
      sex,
      professional,
      district,
      house,
      buyTime,
      vinCode,
      comment,
      addressData,
      brand,
      categoryList,
      vehicleType,
      motorCode,
      manufactureDate
    } = this.props
    return (
      <Fragment>
        <Form {...formItemLayout}>
          <p className={styles.ignoreSubTitle}>基本信息</p>
          <Form.Item
            label={
              <span>
                <span className={styles.requiredPrefix}>*</span>电话
              </span>
            }
          >
            {this.props.phone.value}
          </Form.Item>
          <Form.Item
            label={
              <span>
                <span className={styles.requiredPrefix}>*</span>姓名
              </span>
            }
            validateStatus={name.validateStatus}
            help={name.errorMsg}
          >
            <Input
              placeholder="请输入姓名"
              value={name.value}
              onChange={e => this.handleInputChange('name', e.target.value, true, '请输入姓名')}
            />
          </Form.Item>
          <Form.Item label="性别">
            <Radio.Group value={sex} onChange={e => this.handleInputChange('sex', e.target.value)}>
              <Radio value="M">男</Radio>
              <Radio value="F">女</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="生日">
            <DatePicker
              disabledDate={disableDate}
              value={birthday ? moment(birthday) : null}
              onChange={(date, dateString) => this.handleInputChange('birthday', dateString)}
            />
          </Form.Item>
          <Form.Item label="职业">
            <Input
              placeholder="请填写职业信息"
              value={professional}
              onChange={e => this.handleInputChange('professional', e.target.value)}
            />
          </Form.Item>
          <Form.Item label="地址">
            <Cascader
              value={district}
              onChange={value => this.handleInputChange('district', value)}
              placeholder="请选择省/市/区"
              options={addressData}
            />
          </Form.Item>
          <Form.Item colon={false} label=" ">
            <Input placeholder="请输入详细地址" value={house} onChange={e => this.handleInputChange('house', e.target.value)} />
          </Form.Item>
          <p className={styles.ignoreSubTitle}>车辆信息</p>
          <Form.Item
            label={
              <span>
                <span className={styles.requiredPrefix}>*</span>购买日期
              </span>
            }
            validateStatus={buyTime.validateStatus}
            help={buyTime.errorMsg}
          >
            <DatePicker
              disabledDate={disableDate}
              value={buyTime.value ? moment(buyTime.value) : null}
              onChange={(date, dateString) => this.handleInputChange('buyTime', dateString, true, '请输入购买日期')}
            />
          </Form.Item>
          <Form.Item
            label={
              <span>
                <span className={styles.requiredPrefix}>*</span>产品品牌
              </span>
            }
            validateStatus={brand.validateStatus}
            help={brand.errorMsg}
          >
            <Select
              placeholder="请选择产品品牌"
              value={brand.value}
              onChange={value => this.handleBrandChange(value, '请选择产品品牌')}
            >
              {categoryList &&
                categoryList.map(({ brandName, sellerBrandId }) => (
                  <Option key={sellerBrandId} value={sellerBrandId}>
                    {brandName}
                  </Option>
                ))}
            </Select>
          </Form.Item>
          <Form.Item
            label={
              <span>
                <span className={styles.requiredPrefix}>*</span>车架号
              </span>
            }
            validateStatus={vinCode.validateStatus}
            help={vinCode.errorMsg}
          >
            <Input
              disabled={!brand.value}
              placeholder="请填写车架号"
              value={vinCode.value}
              onChange={e => this.handleInputChange('vinCode', e.target.value, true, '请填写车架号')}
              onBlur={this.checkExistVinCode}
            />
          </Form.Item>
          <Form.Item label="车辆型号">
            <Input
              disabled={this.checkFieldDisable('vehicleType')}
              placeholder="请填写车辆型号"
              value={vehicleType}
              onChange={e => this.handleInputChange('vehicleType', e.target.value)}
            />
          </Form.Item>
          <Form.Item label="发动机号">
            <Input
              disabled={this.checkFieldDisable('motroCode')}
              placeholder="请填写发动机号"
              value={motorCode}
              onChange={e => this.handleInputChange('motorCode', e.target.value)}
            />
          </Form.Item>
          <Form.Item label="出厂日期">
            <DatePicker
              disabled={this.checkFieldDisable('manufactureDate')}
              disabledDate={disableDate}
              value={manufactureDate ? moment(manufactureDate) : null}
              onChange={(date, dateString) => this.handleInputChange('manufactureDate', dateString)}
            />
          </Form.Item>
          <p className={styles.ignoreSubTitle}>备注信息</p>
          <Form.Item label="备注信息">
            <Input.TextArea
              placeholder="备注信息不超过500字"
              maxLength={500}
              autosize={{ minRows: 3, maxRows: 5 }}
              value={comment}
              onChange={this.handleCommentChange}
            />
          </Form.Item>
          <Form.Item {...tailFormItemLayout}>
            <Button className={styles.cancelBtn} onClick={this.goBack}>
              返回
            </Button>
            <Button className={styles.btn} type="primary" onClick={this.handleSubmit}>
              保存
            </Button>
          </Form.Item>
        </Form>
        <OutBoundRemarkModal />
      </Fragment>
    )
  }
}

const mapStateToProps = models => ({
  ...models[namespace]
})

const WrappedRegistrationForm = connect(mapStateToProps)(RegistrationForm)

export default WrappedRegistrationForm
