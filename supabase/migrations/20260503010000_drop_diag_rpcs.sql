-- Remove temporary diagnostic RPCs created while debugging form submissions.
drop function if exists public._diag_policies(text);
drop function if exists public._diag_policies_v2(text);
drop function if exists public._diag_grants(text);
