<?php

namespace App\Http\Controllers;

use App\Models\Board;
use App\Models\CardList;
use Illuminate\Http\Request;
use App\Traits\ResolvesPermissions;

class CardListController extends Controller
{
    use ResolvesPermissions;
    public function store(Request $request, Board $board)
    {
        $this->authorizeProjectAction($request->user(), $board->id, 'section_manage');

        $request->validate([
            'name' => 'required|string|max:50',
            'position' => 'integer'
        ]);

        $board->cardLists()->create([
            'name' => $request->name,
            'position' => $request->position ?? $board->cardLists()->count()
        ]);

        return back();
    }

    public function destroy(CardList $cardList)
    {
        $this->authorizeProjectAction(request()->user(), $cardList->board_id, 'section_manage');

        $cardList->delete();
        return back();
    }

    public function reorder(Request $request, Board $board)
    {
        $this->authorizeProjectAction($request->user(), $board->id, 'section_manage');

        $request->validate(['order' => 'required|array']);
        foreach ($request->order as $index => $listId) {
            $board->cardLists()->where('id', $listId)->update(['position' => $index]);
        }
        return back();
    }
}
