<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use App\Services\ActivityLogService;
use Illuminate\Support\Facades\Auth;

class LogNavigationMiddleware
{
    protected $activityLog;

    public function __construct(ActivityLogService $activityLog)
    {
        $this->activityLog = $activityLog;
    }

    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        // Only log GET requests that are successful and targeted at web routes
        if ($request->isMethod('GET') && $response->getStatusCode() === 200 && Auth::check()) {
            
            // Skip common non-navigation routes
            $excludedPatterns = [
                'api/*',
                'up',
                'sanctum/csrf-cookie',
                'livewire/*',
                '*.js',
                '*.css',
                '*.png',
                '*.jpg',
            ];

            foreach ($excludedPatterns as $pattern) {
                if ($request->is($pattern)) {
                    return $response;
                }
            }

            $currentPath = $request->path();
            $routeName = $request->route() ? $request->route()->getName() : $currentPath;

            // Simple "Menu" logic: if it's a main route or has a specific pattern
            // We can log it as "Pindah Menu"
            $this->activityLog->log('Navigation', "User moved to: {$routeName} (Path: /{$currentPath})");
        }

        return $response;
    }
}
