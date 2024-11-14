import {
  MigrationInterface,
  QueryRunner,
  Table,
  TableForeignKey,
} from 'typeorm';

export class CreatingWishlists1731567247739 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.createTable(
      new Table({
        name: 'wishlists',
        columns: [
          {
            name: 'wishlistId',
            type: 'uuid',
            isPrimary: true,
            generationStrategy: 'uuid',
            default: 'uuid_generate_v4()',
          },
          {
            name: 'userId',
            type: 'uuid',
            isUnique: true,
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
      'wishlists',
      new TableForeignKey({
        columnNames: ['userId'],
        referencedColumnNames: ['userId'],
        referencedTableName: 'users',
        onDelete: 'CASCADE',
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    const table = await queryRunner.getTable('wishlists');
    const foreignKey = table.foreignKeys.find((fk) =>
      fk.columnNames.includes('userId'),
    );
    if (foreignKey) {
      await queryRunner.dropForeignKey('wishlists', foreignKey);
    }

    await queryRunner.dropTable('wishlists');
  }
}
