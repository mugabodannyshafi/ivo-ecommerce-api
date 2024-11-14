import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreatingOrder1731567198446 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'orders',
        columns: [
          {
            name: 'orderId',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'uuid',
            isNullable: false,
          },
          {
            name: 'orderDate',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'status',
            type: 'varchar',
            default: `'pending'`,
          },
          {
            name: 'address',
            type: 'varchar',
          },
          {
            name: 'totalAmount',
            type: 'decimal',
            precision: 10,
            scale: 2,
          },
          {
            name: 'city',
            type: 'varchar',
          },
          {
            name: 'phone',
            type: 'varchar',
          },
          {
            name: 'country',
            type: 'varchar',
          },
          {
            name: 'createdAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
          {
            name: 'updatedAt',
            type: 'timestamp',
            default: 'CURRENT_TIMESTAMP',
          },
        ],
      }),
      true,
    );

    await queryRunner.createForeignKey(
      'orders',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['userId'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('orders');
    const foreignKey = table.foreignKeys.find(
      (fk) => fk.columnNames.indexOf('userId') !== -1,
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('orders', foreignKey);
    }

    await queryRunner.dropTable('orders');
  }
}
