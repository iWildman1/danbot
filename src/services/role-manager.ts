import type { GuildMember } from "discord.js";
import { env } from "@/env";

export async function assignRole(
  member: GuildMember,
  preference: "notifications" | "access_only"
) {
  try {
    const roleId =
      preference === "notifications"
        ? env.INSTANT_NOTIFICATIONS_ROLE_ID
        : env.INSTANT_ACCESS_ROLE_ID;

    // Check if user already has the role
    if (member.roles.cache.has(roleId)) {
      throw new Error("You already have this role!");
    }

    // Remove the other role if they have it (switching preferences)
    const otherRoleId =
      preference === "notifications"
        ? env.INSTANT_ACCESS_ROLE_ID
        : env.INSTANT_NOTIFICATIONS_ROLE_ID;

    if (member.roles.cache.has(otherRoleId)) {
      await member.roles.remove(otherRoleId);
    }

    // Add the requested role
    await member.roles.add(roleId);

    if (env.NODE_ENV === "development") {
      console.log(
        `[RoleManager DEV] Successfully assigned role to ${member.user.tag} (${preference})`
      );
    }
  } catch (error) {
    console.error(
      `[RoleManager] Failed to assign role to ${member.user.tag}:`,
      error
    );
    throw error;
  }
}

export function hasAccess(member: GuildMember): boolean {
  return (
    member.roles.cache.has(env.INSTANT_NOTIFICATIONS_ROLE_ID) ||
    member.roles.cache.has(env.INSTANT_ACCESS_ROLE_ID)
  );
}

export function getPreference(member: GuildMember) {
  if (member.roles.cache.has(env.INSTANT_NOTIFICATIONS_ROLE_ID)) {
    return "notifications";
  }
  if (member.roles.cache.has(env.INSTANT_ACCESS_ROLE_ID)) {
    return "access_only";
  }
  return null;
}

export async function assignDailyRole(
  member: GuildMember,
  preference: "notifications" | "access_only"
) {
  try {
    const roleId =
      preference === "notifications"
        ? env.DAILY_NOTIFICATIONS_ROLE_ID
        : env.DAILY_ACCESS_ROLE_ID;

    if (member.roles.cache.has(roleId)) {
      throw new Error("You already have this role!");
    }

    const otherRoleId =
      preference === "notifications"
        ? env.DAILY_ACCESS_ROLE_ID
        : env.DAILY_NOTIFICATIONS_ROLE_ID;

    if (member.roles.cache.has(otherRoleId)) {
      await member.roles.remove(otherRoleId);
    }

    await member.roles.add(roleId);

    if (env.NODE_ENV === "development") {
      console.log(
        `[RoleManager DEV] Successfully assigned daily role to ${member.user.tag} (${preference})`
      );
    }
  } catch (error) {
    console.error(
      `[RoleManager] Failed to assign daily role to ${member.user.tag}:`,
      error
    );
    throw error;
  }
}

export function hasDailyAccess(member: GuildMember): boolean {
  return (
    member.roles.cache.has(env.DAILY_NOTIFICATIONS_ROLE_ID) ||
    member.roles.cache.has(env.DAILY_ACCESS_ROLE_ID)
  );
}

export function getDailyPreference(member: GuildMember) {
  if (member.roles.cache.has(env.DAILY_NOTIFICATIONS_ROLE_ID)) {
    return "notifications";
  }
  if (member.roles.cache.has(env.DAILY_ACCESS_ROLE_ID)) {
    return "access_only";
  }
  return null;
}
