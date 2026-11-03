/**
 * @fileoverview Members and outgoing invitations of the current organization
 * (entity_pages' MembersManagementPage; role-gated).
 */
import { MembersManagementPage } from '@sudobility/entity_pages';
import { useCurrentEntity } from '@sudobility/entity_client';
import { useAuth } from '@/context/AuthContext';
import { Loading } from '@/components/PageState';
import { useEntityClient } from '@/config/entityClient';

export default function MembersPage() {
  const client = useEntityClient();
  const { currentEntity, isLoading } = useCurrentEntity();
  const { user } = useAuth();
  if (isLoading || !currentEntity || !user?.uid) return <Loading />;
  return <MembersManagementPage client={client} entity={currentEntity} currentUserId={user.uid} />;
}
