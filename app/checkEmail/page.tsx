

export default function checkEmail() {

    return(
        <div className="flex flex-col items-center">
            <h1 className="text-4xl mb-20">Verify Your Email</h1>
            <p className="text-xl mb-5">Please check your email for a verification link.</p>
            <p>Virginia Tech quarantines this email!</p>
            <p>please release <strong>AND preview</strong> the email here: <a 
            href="http://security.microsoft.com/quarantine"
            className="font-bold text-blue-400 hover:underline"
            >Microsoft Quarantine</a></p>
        </div>
    );
}
export const metadata = {
  title: "Verify • VT Craft",
};