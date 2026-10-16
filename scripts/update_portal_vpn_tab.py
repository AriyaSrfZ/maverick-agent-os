#!/usr/bin/env python3
import sys

with open('/var/www/videos/index.html', 'r', encoding='utf-8') as f:
    html = f.read()

# Add nav button if not present
if 'btn-tab-vpn' not in html:
    btn_marker = '<button id="btn-tab-screening" class="nav-btn" onclick="switchTab(\'tab-screening\')">Media Studio & Shorts</button>'
    new_btn = btn_marker + '\n      <button id="btn-tab-vpn" class="nav-btn" onclick="switchTab(\'tab-vpn\')">VPN Nodes & AnyDesk</button>'
    html = html.replace(btn_marker, new_btn)

# Add tab pane before </main>
if 'id="tab-vpn"' not in html:
    tab_marker = '</main>'
    new_tab = """  <!-- TAB 3: VPN NODES & CLIENT CONFIGS -->
  <div id="tab-vpn" class="tab-pane">
    <div class="hero-card" style="border: 1px solid #10b981;">
      <div class="hero-title" style="color: #10b981; font-size: 24px;">Multi-Device VPN & Remote Access Infrastructure</div>
      <div class="hero-desc">
        Verified fixed IP egress nodes for Mobile (Android/iOS), Windows PC, and Linux Workstation. Compatible with WireGuard, AmneziaWG, v2rayNG, PattNG, Hiddify, and AnyDesk.
      </div>
    </div>

    <!-- ANYDESK DIRECT LAN ACCESS -->
    <div class="spec-card" style="margin-bottom: 24px; border: 2px solid #ef4444; background: rgba(239, 68, 68, 0.05);">
      <div class="spec-title" style="color: #ef4444;">AnyDesk Direct Connection (Bypasses Blocked Relay Servers)</div>
      <div class="spec-desc">
        Iranian DPI blocks AnyDesk official relay servers (relay-*.net.anydesk.com). If connecting over home Wi-Fi, enter the direct LAN IP in AnyDesk instead of the 9-digit ID.
      </div>
      <div style="margin-top: 12px; font-family: monospace; background: #000; padding: 12px; border-radius: 6px; color: #38bdf8;">
        <strong>Direct LAN Address:</strong> 192.168.3.64:7070 (or simply 192.168.3.64)<br>
        <strong>Workstation AnyDesk ID:</strong> 1255711623 (Works when client is on VPN)
      </div>
    </div>

    <!-- NODE 1: STOCKHOLM SWEDEN FIXED IP -->
    <div class="spec-card" style="margin-bottom: 24px;">
      <div class="spec-title" style="color: #38bdf8;">Node 1: Stockholm Sweden Fixed IP (109.120.131.224)</div>
      <div class="spec-desc">Primary European fixed IP for Google Cloud $300 credit registration and unblocked global egress.</div>
      
      <div style="display: flex; gap: 24px; flex-wrap: wrap; margin-top: 16px;">
        <div style="text-align: center;">
          <img src="stockholm_wireguard_qr.png" alt="Stockholm WireGuard QR" style="width: 180px; height: 180px; border-radius: 8px; border: 2px solid #38bdf8; background: #fff; padding: 6px;">
          <div style="margin-top: 8px;"><a class="badge-link" href="stockholm_wireguard.conf" download>Download .conf</a></div>
        </div>
        <div style="flex: 1; min-width: 280px;">
          <div style="font-weight: 700; margin-bottom: 6px; color: #fff;">1. WireGuard / AmneziaWG (Recommended)</div>
          <div style="font-size: 13px; color: #94a3b8; margin-bottom: 12px;">Open WireGuard app on Mobile or Windows -> Tap '+' -> Scan QR code above, or download .conf file.</div>
          
          <div style="font-weight: 700; margin-bottom: 6px; color: #fff;">2. VLESS Reality (Samsung SNI - Port 443)</div>
          <div style="font-size: 12px; font-family: monospace; background: #000; padding: 8px; border-radius: 4px; word-break: break-all; color: #a7f3d0; margin-bottom: 12px;">
            vless://e6f84904-c8e3-475a-91a7-2db33520b9ec@109.120.131.224:443?security=reality&encryption=none&pbk=irI6g1W0eBrErQlXzgOiRgGs2RcsHx7ZlslecFiIGVA&headerType=none&fp=chrome&spx=%2F&type=tcp&flow=xtls-rprx-vision&sni=www.samsung.com&sid=93ba094de0e41ba5#Stockholm-Samsung-443
          </div>
          <div style="font-size: 12px; color: #94a3b8; margin-bottom: 12px;">Import into PattNG / v2rayNG / Hiddify. On Irancell/MCI, enable Fragment in client settings.</div>

          <div style="font-weight: 700; margin-bottom: 6px; color: #fff;">3. Shadowsocks (Port 8388)</div>
          <div style="font-size: 12px; font-family: monospace; background: #000; padding: 8px; border-radius: 4px; word-break: break-all; color: #fde68a;">
            ss://YWVzLTI1Ni1nY206TWF2ZXJpY2tGaXhlZElQU3RvY2tob2xtMjAyNiE=@109.120.131.224:8388#Stockholm-FixedIP-Shadowsocks
          </div>
        </div>
      </div>
    </div>

    <!-- NODE 2: GERMAN HETZNER BACKUP IP -->
    <div class="spec-card">
      <div class="spec-title" style="color: #f59e0b;">Node 2: Germany Backup IP (91.99.125.45)</div>
      <div class="spec-desc">Secondary German egress route hosted on Hetzner Online GmbH.</div>
      
      <div style="display: flex; gap: 24px; flex-wrap: wrap; margin-top: 16px;">
        <div style="text-align: center;">
          <img src="wireguard_hetzner_de_qr.png" alt="Germany WireGuard QR" style="width: 180px; height: 180px; border-radius: 8px; border: 2px solid #f59e0b; background: #fff; padding: 6px;">
          <div style="margin-top: 8px;"><a class="badge-link" href="wireguard_hetzner_de.conf" download>Download .conf</a></div>
        </div>
        <div style="flex: 1; min-width: 280px;">
          <div style="font-weight: 700; margin-bottom: 6px; color: #fff;">WireGuard Direct Tunnel</div>
          <div style="font-size: 13px; color: #94a3b8; margin-bottom: 8px;">Scan with WireGuard on Android, iOS, or Windows. Provides high-speed German IP routing.</div>
        </div>
      </div>
    </div>
  </div>
""" + tab_marker
    html = html.replace(tab_marker, new_tab)

with open('/var/www/videos/index.html', 'w', encoding='utf-8') as f:
    f.write(html)

print("Updated /var/www/videos/index.html successfully!")
