import { Column, Model, Table, DataType } from 'sequelize-typescript'

@Table
export class AlertFee extends Model {
  @Column(DataType.TEXT({ length: 'medium' }))
  webhookUrl: string

  @Column(DataType.FLOAT())
  fee: number

  @Column
  active: boolean
}
