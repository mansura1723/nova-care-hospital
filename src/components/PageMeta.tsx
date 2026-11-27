import React, { useEffect } from 'react';

export const PageMeta: React.FC<{ title: string; description: string }> = ({
  title,
  description,
}) => {
  useEffect(() => {
    document.title = `${title} | Nova Care Hospital`;
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description);
    }
  }, [title, description]);

  return null;
};
