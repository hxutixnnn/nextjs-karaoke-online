import {
  useAuthState,
  useSignInWithGoogle,
  useSignOut,
} from "react-firebase-hooks/auth";
import { auth } from "../utils/firebase";

export default function UserAccount() {
  const [user, loading, error] = useAuthState(auth);

  if (loading) {
    return (
      <div>
        <p>Initialising User...</p>
      </div>
    );
  }
  if (error) {
    return (
      <div>
        <p>Error: {error.message}</p>
      </div>
    );
  }
  if (!user) {
    return (
      <div className="col-span-full">
        <LoginButton />
      </div>
    );
  }
  return (
    <div className="col-span-full">
      <div className="flex flex-row justify-between items-center w-full">
        <div>
          Email: <strong>{user.email}</strong>
        </div>
        <SignOutButton />
      </div>
    </div>
  );
}

function LoginButton() {
  const [signInWithGoogle, user, loading, error] = useSignInWithGoogle(auth);

  if (error) {
    return (
      <div>
        <p>Error: {error.message}</p>
      </div>
    );
  }
  return (
    <div className="col-span-full">
      <button
        className={`btn btn-primary btn-sm ${loading ? "loading" : ""}`}
        onClick={() => signInWithGoogle()}
      >
        Đăng nhập với Google
      </button>
    </div>
  );
}

function SignOutButton() {
  const [signOut, loading, error] = useSignOut(auth);

  if (error) {
    return (
      <div>
        <p>Error: {error.message}</p>
      </div>
    );
  }
  return (
    <button
      className={`btn btn-primary btn-sm ${loading ? "loading" : ""}`}
      onClick={() => signOut()}
    >
      Đăng Xuất
    </button>
  );
}
