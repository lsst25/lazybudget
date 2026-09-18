import {
  LogoutOutline,
  MenuFoldOutline,
  MenuUnfoldOutline,
  WalletOutline,
} from '@ant-design/icons-angular/icons';

/**
 * Icons used by the app shell are registered statically so they render
 * without a network request (and in unit tests). Icons used inside pages
 * may rely on dynamic loading from /assets.
 */
export const icons = [LogoutOutline, MenuFoldOutline, MenuUnfoldOutline, WalletOutline];
