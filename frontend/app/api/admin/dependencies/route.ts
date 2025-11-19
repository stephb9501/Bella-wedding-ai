import { NextRequest, NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// GET: Get dependency and service update information
export async function GET(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const canView = await supabase.rpc('has_admin_permission', {
      p_user_id: user.id,
      p_permission: 'can_view_analytics',
    });

    if (!canView.data) {
      return NextResponse.json({
        error: 'Permission denied: can_view_analytics required'
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const report_type = searchParams.get('report_type') || 'summary';

    if (report_type === 'summary') {
      // Overall dependency summary
      const { data: services } = await supabase
        .from('external_services')
        .select('*')
        .order('service_name');

      const { data: packagesNeedingUpdate } = await supabase
        .from('npm_packages')
        .select('*')
        .eq('update_available', true);

      const { data: vulnerabilities } = await supabase
        .from('vulnerable_packages')
        .select('*');

      const { data: securitySummary } = await supabase
        .from('security_summary')
        .select('*')
        .single();

      const { data: activeNotifications } = await supabase
        .from('active_update_notifications')
        .select('*');

      return NextResponse.json({
        services: services || [],
        packages_needing_update: packagesNeedingUpdate || [],
        vulnerable_packages: vulnerabilities || [],
        security_summary: securitySummary || {},
        active_notifications: activeNotifications || [],
        total_services: services?.length || 0,
        total_updates_available: (packagesNeedingUpdate?.length || 0) + (services?.filter(s => s.update_available)?.length || 0),
        total_vulnerabilities: securitySummary?.total_vulnerabilities || 0,
      });

    } else if (report_type === 'services') {
      // All external services
      const { data: services, error } = await supabase
        .from('external_services')
        .select('*')
        .order('service_name');

      if (error) {
        console.error('Services fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch services' }, { status: 500 });
      }

      return NextResponse.json({
        services: services || [],
        total: services?.length || 0,
      });

    } else if (report_type === 'services_needing_updates') {
      // Services with updates available
      const { data: servicesNeedingUpdates, error } = await supabase
        .from('services_needing_updates')
        .select('*');

      if (error) {
        console.error('Services needing updates error:', error);
        return NextResponse.json({ error: 'Failed to fetch services needing updates' }, { status: 500 });
      }

      return NextResponse.json({
        services: servicesNeedingUpdates || [],
        total: servicesNeedingUpdates?.length || 0,
      });

    } else if (report_type === 'packages') {
      // All npm packages
      const { data: packages, error } = await supabase
        .from('npm_packages')
        .select('*')
        .order('package_name');

      if (error) {
        console.error('Packages fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch packages' }, { status: 500 });
      }

      return NextResponse.json({
        packages: packages || [],
        total: packages?.length || 0,
      });

    } else if (report_type === 'vulnerabilities') {
      // Security vulnerabilities
      const { data: vulnerabilities, error } = await supabase
        .from('security_vulnerabilities')
        .select('*')
        .eq('is_patched', false)
        .order('severity', { ascending: true });

      if (error) {
        console.error('Vulnerabilities fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch vulnerabilities' }, { status: 500 });
      }

      return NextResponse.json({
        vulnerabilities: vulnerabilities || [],
        total: vulnerabilities?.length || 0,
      });

    } else if (report_type === 'api_deprecations') {
      // Upcoming API deprecations
      const { data: deprecations, error } = await supabase
        .from('upcoming_api_deprecations')
        .select('*');

      if (error) {
        console.error('Deprecations fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch API deprecations' }, { status: 500 });
      }

      return NextResponse.json({
        deprecations: deprecations || [],
        total: deprecations?.length || 0,
      });

    } else if (report_type === 'notifications') {
      // Active update notifications
      const { data: notifications, error } = await supabase
        .from('update_notifications')
        .select('*')
        .eq('is_resolved', false)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Notifications fetch error:', error);
        return NextResponse.json({ error: 'Failed to fetch notifications' }, { status: 500 });
      }

      return NextResponse.json({
        notifications: notifications || [],
        total: notifications?.length || 0,
      });

    } else {
      return NextResponse.json({ error: 'Invalid report_type' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Dependencies error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST: Add/update service or package, or trigger update check
export async function POST(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const canManage = await supabase.rpc('has_admin_permission', {
      p_user_id: user.id,
      p_permission: 'can_manage_billing',
    });

    if (!canManage.data) {
      return NextResponse.json({
        error: 'Permission denied: can_manage_billing required'
      }, { status: 403 });
    }

    const body = await request.json();
    const { action } = body;

    if (action === 'add_service') {
      // Add a new external service to track
      const {
        service_name,
        service_category,
        provider,
        current_version,
        current_api_version,
        documentation_url,
        current_plan,
        monthly_cost = 0.00,
      } = body;

      if (!service_name || !service_category || !provider) {
        return NextResponse.json(
          { error: 'service_name, service_category, and provider are required' },
          { status: 400 }
        );
      }

      const { data: service, error } = await supabase
        .from('external_services')
        .insert({
          service_name,
          service_category,
          provider,
          current_version,
          current_api_version,
          documentation_url,
          current_plan,
          monthly_cost,
        })
        .select()
        .single();

      if (error) {
        console.error('Add service error:', error);
        return NextResponse.json({ error: 'Failed to add service' }, { status: 500 });
      }

      return NextResponse.json({
        message: 'Service added successfully',
        service,
      });

    } else if (action === 'update_service_version') {
      // Update current version for a service
      const {
        service_name,
        current_version,
        current_api_version,
      } = body;

      if (!service_name) {
        return NextResponse.json(
          { error: 'service_name is required' },
          { status: 400 }
        );
      }

      const updates: any = {};
      if (current_version) updates.current_version = current_version;
      if (current_api_version) updates.current_api_version = current_api_version;
      updates.last_checked = new Date().toISOString();

      const { data: service, error } = await supabase
        .from('external_services')
        .update(updates)
        .eq('service_name', service_name)
        .select()
        .single();

      if (error) {
        console.error('Update service error:', error);
        return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
      }

      return NextResponse.json({
        message: 'Service version updated successfully',
        service,
      });

    } else if (action === 'add_package') {
      // Add npm package to track
      const {
        package_name,
        package_type,
        current_version,
        is_critical = false,
      } = body;

      if (!package_name || !current_version) {
        return NextResponse.json(
          { error: 'package_name and current_version are required' },
          { status: 400 }
        );
      }

      const { data: pkg, error } = await supabase
        .from('npm_packages')
        .insert({
          package_name,
          package_type: package_type || 'dependency',
          current_version,
          is_critical,
        })
        .select()
        .single();

      if (error) {
        console.error('Add package error:', error);
        return NextResponse.json({ error: 'Failed to add package' }, { status: 500 });
      }

      return NextResponse.json({
        message: 'Package added successfully',
        package: pkg,
      });

    } else if (action === 'report_vulnerability') {
      // Report a security vulnerability
      const {
        cve_id,
        vulnerability_title,
        description,
        affected_package,
        affected_service,
        severity,
        fixed_in_version,
      } = body;

      if (!vulnerability_title || !severity) {
        return NextResponse.json(
          { error: 'vulnerability_title and severity are required' },
          { status: 400 }
        );
      }

      const { data: vulnerability, error } = await supabase
        .from('security_vulnerabilities')
        .insert({
          cve_id,
          vulnerability_title,
          description,
          affected_package,
          affected_service,
          severity,
          fixed_in_version,
          published_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('Report vulnerability error:', error);
        return NextResponse.json({ error: 'Failed to report vulnerability' }, { status: 500 });
      }

      // Create notification
      await supabase
        .from('update_notifications')
        .insert({
          update_type: 'security_vulnerability',
          title: vulnerability_title,
          description,
          severity: severity === 'critical' || severity === 'high' ? 'critical' : 'warning',
          is_security_update: true,
          requires_action: true,
        });

      return NextResponse.json({
        message: 'Vulnerability reported successfully',
        vulnerability,
      });

    } else if (action === 'resolve_notification') {
      // Resolve an update notification
      const {
        notification_id,
        resolution_notes,
      } = body;

      if (!notification_id) {
        return NextResponse.json(
          { error: 'notification_id is required' },
          { status: 400 }
        );
      }

      const { error } = await supabase.rpc('resolve_update_notification', {
        p_notification_id: notification_id,
        p_user_id: user.id,
        p_resolution_notes: resolution_notes || null,
      });

      if (error) {
        console.error('Resolve notification error:', error);
        return NextResponse.json({ error: 'Failed to resolve notification' }, { status: 500 });
      }

      return NextResponse.json({
        message: 'Notification resolved successfully',
      });

    } else if (action === 'mark_vulnerability_patched') {
      // Mark a vulnerability as patched
      const { vulnerability_id } = body;

      if (!vulnerability_id) {
        return NextResponse.json(
          { error: 'vulnerability_id is required' },
          { status: 400 }
        );
      }

      const { error } = await supabase.rpc('mark_vulnerability_patched', {
        p_vulnerability_id: vulnerability_id,
        p_user_id: user.id,
      });

      if (error) {
        console.error('Mark patched error:', error);
        return NextResponse.json({ error: 'Failed to mark vulnerability as patched' }, { status: 500 });
      }

      return NextResponse.json({
        message: 'Vulnerability marked as patched successfully',
      });

    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    console.error('Dependencies operation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT: Update service or package information
export async function PUT(request: NextRequest) {
  try {
    const supabase = createRouteHandlerClient({ cookies });

    // Check authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const canManage = await supabase.rpc('has_admin_permission', {
      p_user_id: user.id,
      p_permission: 'can_manage_billing',
    });

    if (!canManage.data) {
      return NextResponse.json({
        error: 'Permission denied: can_manage_billing required'
      }, { status: 403 });
    }

    const body = await request.json();
    const {
      service_name,
      latest_version,
      update_available,
      update_priority,
      monthly_cost,
    } = body;

    if (!service_name) {
      return NextResponse.json(
        { error: 'service_name is required' },
        { status: 400 }
      );
    }

    // Build update object
    const updates: any = {};
    if (latest_version !== undefined) updates.latest_version = latest_version;
    if (update_available !== undefined) updates.update_available = update_available;
    if (update_priority !== undefined) updates.update_priority = update_priority;
    if (monthly_cost !== undefined) updates.monthly_cost = monthly_cost;
    updates.last_checked = new Date().toISOString();

    // Update service
    const { data: service, error } = await supabase
      .from('external_services')
      .update(updates)
      .eq('service_name', service_name)
      .select()
      .single();

    if (error) {
      console.error('Update service error:', error);
      return NextResponse.json({ error: 'Failed to update service' }, { status: 500 });
    }

    return NextResponse.json({
      message: 'Service updated successfully',
      service,
    });
  } catch (error: any) {
    console.error('Service update error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
