<?php

namespace App\Providers;

use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;
use App\Models\SmtpSetting;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\URL;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        if (Schema::hasTable('smtp_settings')) {
            $smtp = SmtpSetting::first();
            if ($smtp) {
                Config::set('mail.mailers.smtp.host', $smtp->host);
                Config::set('mail.mailers.smtp.port', $smtp->port);
                Config::set('mail.mailers.smtp.username', $smtp->username);
                Config::set('mail.mailers.smtp.password', $smtp->password);
                Config::set('mail.mailers.smtp.encryption', $smtp->encryption);
                Config::set('mail.from.address', $smtp->from_address);
                Config::set('mail.from.name', $smtp->from_name);
                
                // Force driver to SMTP if settings exist and not using log
                if (Config::get('mail.default') === 'log') {
                    // Stay in log for local if no password set? Or just force it?
                    // Let's force it if settings are provided through UI.
                    Config::set('mail.default', 'smtp');
                }
            }
        }

        if (env('APP_ENV') === 'production') {
            URL::forceScheme('https');
        }
    }
}
