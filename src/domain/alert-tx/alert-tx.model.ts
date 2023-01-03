import { Column, Model, Table, DataType } from 'sequelize-typescript'

@Table
export class AlertTx extends Model {
  @Column(DataType.TEXT({ length: 'medium' }))
  webhookUrl: string

  @Column(DataType.STRING(64))
  txId: string

  @Column
  confirmationsAlert: number

  @Column
  active: boolean
}
