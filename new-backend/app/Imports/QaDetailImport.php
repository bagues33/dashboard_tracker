<?php

namespace App\Imports;

use App\Models\Checklist;
use App\Models\QaDetail;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class QaDetailImport implements ToCollection, WithHeadingRow
{
    protected $checklist;

    public function __construct(Checklist $checklist)
    {
        $this->checklist = $checklist;
    }

    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            $title = $row['title'] ?? null;
            if (!$title) continue;

            QaDetail::create([
                'checklist_id' => $this->checklist->id,
                'title' => $title,
                'priority' => $row['priority'] ?? 'medium',
                'status' => $row['status'] ?? 'to do',
                'expected_result' => $row['expected_result'] ?? '',
                'steps_to_reproduce' => $row['steps_to_reproduce'] ?? '',
                'image_url' => $row['image_url'] ?? null,
                'error_url' => $row['error_url'] ?? null,
                'position' => QaDetail::where('checklist_id', $this->checklist->id)->max('position') + 1
            ]);
        }
    }
}
