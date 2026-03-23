<?php

namespace App\Imports;

use App\Models\Board;
use App\Models\Card;
use App\Models\CardList;
use App\Models\Checklist;
use App\Models\QaDetail;
use App\Models\User;
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class ProjectDataImport implements ToCollection, WithHeadingRow
{
    protected $board;

    public function __construct(Board $board)
    {
        $this->board = $board;
    }

    public function collection(Collection $rows)
    {
        foreach ($rows as $row) {
            $listName = $row['list_name'] ?? null;
            $taskTitle = $row['task_title'] ?? null;

            if (!$listName || !$taskTitle) continue;

            // 1. Find or Create List
            $cardList = CardList::firstOrCreate([
                'board_id' => $this->board->id,
                'name' => $listName
            ], [
                'position' => CardList::where('board_id', $this->board->id)->max('position') + 1
            ]);

            // 2. Find or Create Card
            $taskAssignee = null;
            if (!empty($row['task_assignee'])) {
                $taskAssignee = User::where('username', $row['task_assignee'])->first();
            }

            $card = Card::updateOrCreate([
                'card_list_id' => $cardList->id,
                'title' => $taskTitle,
            ], [
                'description' => $row['task_description'] ?? '',
                'assigned_to' => $taskAssignee?->id,
                'priority' => $row['task_priority'] ?? 'medium',
                'due_date' => $row['task_due_date'] ?? null,
                'position' => Card::where('card_list_id', $cardList->id)->max('position') + 1
            ]);

            // 3. Subtask (Checklist)
            if (!empty($row['subtask_content'])) {
                $subtaskAssignee = null;
                if (!empty($row['subtask_assignee'])) {
                    $subtaskAssignee = User::where('username', $row['subtask_assignee'])->first();
                }

                $checklist = Checklist::updateOrCreate([
                    'card_id' => $card->id,
                    'content' => $row['subtask_content']
                ], [
                    'status' => $row['subtask_status'] ?? 'to do',
                    'priority' => $row['subtask_priority'] ?? 'medium',
                    'assigned_to' => $subtaskAssignee?->id,
                    'expected_result' => $row['subtask_expected_result'] ?? null,
                    'steps_to_reproduce' => $row['subtask_steps'] ?? null,
                    'image_url' => $row['subtask_image_url'] ?? null,
                    'error_url' => $row['subtask_error_url'] ?? null,
                    'position' => Checklist::where('card_id', $card->id)->max('position') + 1
                ]);

                // 4. Detail Subtask (QaDetail)
                if (!empty($row['detail_title'])) {
                    $detailAssignee = null;
                    if (!empty($row['detail_assignee'])) {
                        $detailAssignee = User::where('username', $row['detail_assignee'])->first();
                    }

                    QaDetail::updateOrCreate([
                        'checklist_id' => $checklist->id,
                        'title' => $row['detail_title']
                    ], [
                        'status' => $row['detail_status'] ?? 'to do',
                        'priority' => $row['detail_priority'] ?? 'medium',
                        'assigned_to' => $detailAssignee?->id,
                        'expected_result' => $row['detail_expected_result'] ?? null,
                        'steps_to_reproduce' => $row['detail_steps'] ?? null,
                        'image_url' => $row['detail_image_url'] ?? null,
                        'error_url' => $row['detail_error_url'] ?? null,
                        'position' => QaDetail::where('checklist_id', $checklist->id)->max('position') + 1
                    ]);
                }
            }
        }
    }
}
