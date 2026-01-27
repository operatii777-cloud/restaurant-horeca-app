/**
 * PHASE S5.5 - Redirect Component with Params
 * Helper component for redirecting routes with parameters
 */

import React from 'react';
import { Navigate, useParams } from 'react-router-dom';

interface RedirectWithParamsProps {
  to: (params: Record<string, string | undefined>) => string;
  replace?: boolean;
}

export const RedirectWithParams: React.FC<RedirectWithParamsProps> = ({ to, replace = true }) => {
  const params = useParams<Record<string, string | undefined>>();
  return <Navigate to={to(params)} replace={replace} />;
};

