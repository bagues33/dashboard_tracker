<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Illuminate\Support\Facades\URL;
use Carbon\Carbon;

class VerifyAccount extends Notification
{
    use Queueable;

    public function __construct()
    {
        //
    }

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $setupUrl = URL::temporarySignedRoute(
            'account.setup',
            Carbon::now()->addHours(24),
            ['id' => $notifiable->getKey(), 'hash' => sha1($notifiable->getEmailForVerification())]
        );

        return (new MailMessage)
            ->subject('Verify Your Account & Set Password')
            ->greeting('Hello, ' . $notifiable->username . '!')
            ->line('Thanks for signing up for Project Tracker. Please click the button below to verify your email address and set your account password.')
            ->action('Set Up My Account', $setupUrl)
            ->line('This link will expire in 24 hours.')
            ->line('If you did not create an account, no further action is required.');
    }

    public function toArray(object $notifiable): array
    {
        return [
            //
        ];
    }
}
