import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class CreateSubCategoryDto {
    @ApiProperty({ example: 'Category name', description: 'Category name' })
    @IsString({ message: 'Must be a string' })
    @IsNotEmpty({ message: 'Must not be empty' })
    parentCategoryId: string;

    @ApiProperty({ example: 'Sub category name', description: 'Sub category name' })
    @IsString({ message: 'Must be a string' })
    @IsNotEmpty({ message: 'Must not be empty' })
    subCategoryName: string;
}
