"use client";
import { useEffect, useState } from 'react';
import EmailVerifyForm from '../components/verifyForm';
//http://security.microsoft.com/quarantine
export default function Verify() {
    return (
        <div className="flex flex-col py-4 items-center">
            <div>
                <h1>Verify Your Email</h1>
            </div>
            <div>
                <EmailVerifyForm />
            </div>
        </div>
    )
}