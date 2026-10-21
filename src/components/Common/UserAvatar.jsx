import React, { useEffect, useState } from 'react';

const UserAvatar = ({ user, className = '' }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const profileImage = user?.profile_image;

  useEffect(() => {
    setImageFailed(false);
  }, [profileImage]);

  return (
    <div className={`relative flex items-center justify-center overflow-hidden rounded-full bg-[var(--primary)]/10 font-bold text-[var(--primary)] ${className}`}>
      {profileImage && !imageFailed ? (
        <img
          src={profileImage}
          alt={user?.full_name || 'Foto de perfil'}
          className="h-full w-full object-cover"
          onError={() => setImageFailed(true)}
        />
      ) : (
        user?.full_name?.charAt(0)?.toUpperCase() || 'U'
      )}
    </div>
  );
};

export default UserAvatar;
