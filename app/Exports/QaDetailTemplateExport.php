<?php

namespace App\Exports;

use Maatwebsite\Excel\Concerns\FromArray;
use Maatwebsite\Excel\Concerns\WithHeadings;

class QaDetailTemplateExport implements FromArray, WithHeadings
{
    public function headings(): array
    {
        return [
            'Title',
            'Priority',
            'Status',
            'Expected Result',
            'Steps to Reproduce',
            'Image URL',
            'Error URL'
        ];
    }

    public function array(): array
    {
        return [
            [
                'Example QA Detail',
                'medium',
                'to do',
                'The system should perform X',
                '1. Open Y, 2. Click Z',
                'http://example.com/image.png',
                'http://example.com/error'
            ]
        ];
    }
}
