<template>
  <div class="p-8 max-w-5xl mx-auto space-y-6">
    <!-- Page header -->
    <div class="mb-8">
      <h2 class="text-2xl font-bold text-white">Dashboard</h2>
      <p class="text-sm text-white/40 mt-1">Manage your sales extension configuration</p>
    </div>

    <!-- Loading state -->
    <div v-if="loadingSettings" class="flex items-center justify-center py-20">
      <svg class="w-8 h-8 text-brand animate-spin" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
      </svg>
    </div>

    <template v-else>
      <!-- Card 1: Usage Stats (admin only) -->
      <SettingsCard v-if="isAdmin" title="Usage Stats" subtitle="Token consumption and estimated costs per user" :default-open="true">
        <template #icon>
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
          </svg>
        </template>

        <div class="space-y-4">
          <!-- Period filter -->
          <div class="flex gap-2">
            <button
              v-for="p in usagePeriods"
              :key="p.value"
              @click="usagePeriod = p.value; loadUsageStats()"
              :class="[
                'px-3 py-1.5 text-xs font-medium rounded-lg transition-all',
                usagePeriod === p.value
                  ? 'bg-brand text-white'
                  : 'bg-navy-800 text-white/50 hover:text-white/70 border border-white/5'
              ]"
            >
              {{ p.label }}
            </button>
          </div>

          <!-- Loading -->
          <div v-if="loadingUsage" class="text-center py-8 text-white/40">Loading usage stats...</div>

          <!-- No data -->
          <div v-else-if="usageStats.users.length === 0" class="text-center py-8 text-white/40">No usage data for this period</div>

          <!-- Stats table -->
          <div v-else class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-white/5">
                  <th class="text-left py-3 px-2 text-white/40 font-medium">User</th>
                  <th class="text-right py-3 px-2 text-white/40 font-medium">Requests</th>
                  <th class="text-right py-3 px-2 text-white/40 font-medium">Prompt</th>
                  <th class="text-right py-3 px-2 text-white/40 font-medium">Output</th>
                  <th class="text-right py-3 px-2 text-white/40 font-medium">Total Tokens</th>
                  <th class="text-right py-3 px-2 text-white/40 font-medium">Est. Cost</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="u in usageStats.users" :key="u.id" class="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td class="py-3 px-2">
                    <div>
                      <span class="text-white font-medium text-xs">{{ u.name }}</span>
                      <p class="text-white/30 text-[10px]">{{ u.email }}</p>
                    </div>
                  </td>
                  <td class="py-3 px-2 text-right text-white/60 tabular-nums">{{ u.totalRequests.toLocaleString() }}</td>
                  <td class="py-3 px-2 text-right text-white/40 tabular-nums text-xs">{{ u.promptTokens.toLocaleString() }}</td>
                  <td class="py-3 px-2 text-right text-white/40 tabular-nums text-xs">{{ u.completionTokens.toLocaleString() }}</td>
                  <td class="py-3 px-2 text-right text-white/60 tabular-nums">{{ u.totalTokens.toLocaleString() }}</td>
                  <td class="py-3 px-2 text-right text-brand-light font-medium tabular-nums">{{ formatCost(u.totalCost) }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="border-t border-white/10">
                  <td class="py-3 px-2 text-white/70 font-semibold text-xs">Total</td>
                  <td class="py-3 px-2 text-right text-white/70 font-semibold tabular-nums">{{ usageStats.totals.totalRequests.toLocaleString() }}</td>
                  <td class="py-3 px-2 text-right text-white/50 tabular-nums text-xs">{{ usageStats.totals.promptTokens.toLocaleString() }}</td>
                  <td class="py-3 px-2 text-right text-white/50 tabular-nums text-xs">{{ usageStats.totals.completionTokens.toLocaleString() }}</td>
                  <td class="py-3 px-2 text-right text-white/70 font-semibold tabular-nums">{{ usageStats.totals.totalTokens.toLocaleString() }}</td>
                  <td class="py-3 px-2 text-right text-brand-light font-bold tabular-nums">{{ formatCost(usageStats.totals.totalCost) }}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </SettingsCard>

      <!-- Card 2: Install Extension -->
      <SettingsCard title="Install Extension" subtitle="Download and install the Sales Extension for Chrome">
        <template #icon>
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
          </svg>
        </template>

        <div class="space-y-6">
          <!-- Download button -->
          <div class="flex items-center gap-4">
            <a
              href="/sales-extension.zip"
              download
              class="btn-primary inline-flex items-center gap-2"
            >
              <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
              </svg>
              Download Extension (.zip)
            </a>
            <span class="text-xs text-white/30">sales-extension.zip</span>
          </div>

          <!-- Installation steps -->
          <div class="space-y-3">
            <h4 class="text-sm font-semibold text-white/80">Installation Steps</h4>
            <ol class="space-y-3">
              <li class="flex gap-3">
                <span class="flex-shrink-0 w-6 h-6 rounded-full bg-brand/20 text-brand-light text-xs font-bold flex items-center justify-center">1</span>
                <div>
                  <p class="text-sm text-white/70">Download the extension zip file using the button above</p>
                </div>
              </li>
              <li class="flex gap-3">
                <span class="flex-shrink-0 w-6 h-6 rounded-full bg-brand/20 text-brand-light text-xs font-bold flex items-center justify-center">2</span>
                <div>
                  <p class="text-sm text-white/70">Unzip the file to a folder on your computer</p>
                  <p class="text-xs text-white/30 mt-0.5">Remember where you extract it — you'll need the path</p>
                </div>
              </li>
              <li class="flex gap-3">
                <span class="flex-shrink-0 w-6 h-6 rounded-full bg-brand/20 text-brand-light text-xs font-bold flex items-center justify-center">3</span>
                <div>
                  <p class="text-sm text-white/70">Open Chrome and go to <code class="text-brand-light bg-brand/10 px-1.5 py-0.5 rounded text-xs font-mono">chrome://extensions</code></p>
                </div>
              </li>
              <li class="flex gap-3">
                <span class="flex-shrink-0 w-6 h-6 rounded-full bg-brand/20 text-brand-light text-xs font-bold flex items-center justify-center">4</span>
                <div>
                  <p class="text-sm text-white/70">Enable <strong class="text-white">Developer mode</strong> (toggle in the top-right corner)</p>
                </div>
              </li>
              <li class="flex gap-3">
                <span class="flex-shrink-0 w-6 h-6 rounded-full bg-brand/20 text-brand-light text-xs font-bold flex items-center justify-center">5</span>
                <div>
                  <p class="text-sm text-white/70">Click <strong class="text-white">Load unpacked</strong> and select the <code class="text-brand-light bg-brand/10 px-1.5 py-0.5 rounded text-xs font-mono">dist</code> folder inside the unzipped directory</p>
                </div>
              </li>
              <li class="flex gap-3">
                <span class="flex-shrink-0 w-6 h-6 rounded-full bg-brand/20 text-brand-light text-xs font-bold flex items-center justify-center">6</span>
                <div>
                  <p class="text-sm text-white/70">Click the extension icon in the toolbar and sign in with your Google account</p>
                  <p class="text-xs text-white/30 mt-0.5">You need to be registered as a user in the dashboard first</p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </SettingsCard>

      <!-- Card 3: Prompts -->
      <SettingsCard title="Prompts" subtitle="Configure guiding principles and message angles">
        <template #icon>
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
          </svg>
        </template>

        <div class="space-y-6">
          <!-- Guiding Principles -->
          <div>
            <label class="block text-sm font-medium text-white/70 mb-2">Guiding Principles</label>
            <textarea
              v-model="prompts.principles"
              :readonly="!isAdmin"
              rows="4"
              placeholder="Enter the base principles the AI should follow when generating content..."
              class="input-field"
            />
          </div>

          <!-- Angles -->
          <div>
            <label class="block text-sm font-medium text-white/70 mb-3">Message Angles</label>
            <div class="space-y-4">
              <div v-for="(angle, i) in prompts.angles" :key="angle.id" class="bg-navy-800 rounded-xl p-4 border border-white/5">
                <div class="flex items-center gap-3 mb-3">
                  <span class="text-xs font-semibold text-brand-light bg-brand/15 px-2 py-1 rounded-md">{{ i + 1 }}</span>
                  <input
                    v-model="angle.name"
                    :readonly="!isAdmin"
                    placeholder="Angle name"
                    class="input-field-sm flex-1"
                  />
                </div>
                <textarea
                  v-model="angle.prompt"
                  :readonly="!isAdmin"
                  rows="2"
                  placeholder="Describe the angle approach..."
                  class="input-field text-sm"
                />
              </div>
            </div>
          </div>

          <!-- Max lengths -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-white/70 mb-2">Email Max Words</label>
              <input
                v-model.number="prompts.emailMaxWords"
                :readonly="!isAdmin"
                type="number"
                class="input-field"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-white/70 mb-2">LinkedIn Max Words</label>
              <input
                v-model.number="prompts.linkedinMaxWords"
                :readonly="!isAdmin"
                type="number"
                class="input-field"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-medium text-white/70 mb-2">Business Info Warning</label>
            <textarea
              v-model="prompts.businessInfoWarning"
              :readonly="!isAdmin"
              rows="2"
              class="input-field"
            />
          </div>

          <!-- Save button -->
          <button
            v-if="isAdmin"
            @click="savePrompts"
            :disabled="savingPrompts"
            class="btn-primary"
          >
            <svg v-if="savingPrompts" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ savingPrompts ? 'Saving...' : 'Save Prompts' }}
          </button>
          <p v-if="promptsSaved" class="text-sm text-green-400 mt-2">Prompts saved successfully!</p>
        </div>
      </SettingsCard>

      <!-- Card 2: Prompt Templates (admin only) -->
      <SettingsCard v-if="isAdmin" title="Prompt Templates" subtitle="Full prompt templates sent to the AI. Use variables for dynamic content.">
        <template #icon>
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
          </svg>
        </template>

        <div class="space-y-6">
          <!-- Variable reference -->
          <div class="bg-navy-800 rounded-xl p-4 border border-white/5">
            <p class="text-xs font-semibold text-brand-light mb-2">Available Variables</p>
            <div class="flex flex-wrap gap-1.5">
              <code v-for="v in templateVars" :key="v" class="text-[10px] px-1.5 py-0.5 bg-brand/10 text-brand-light rounded font-mono">{{ wrapVar(v) }}</code>
            </div>
          </div>

          <!-- Tabs -->
          <div class="flex gap-1 bg-navy-800 rounded-lg p-1 border border-white/5">
            <button
              v-for="tab in promptTabs"
              :key="tab.id"
              @click="activePromptTab = tab.id"
              :class="[
                'flex-1 px-3 py-2 text-xs font-medium rounded-md transition-all',
                activePromptTab === tab.id
                  ? 'bg-brand text-white'
                  : 'text-white/50 hover:text-white/70'
              ]"
            >
              {{ tab.label }}
            </button>
          </div>

          <!-- Email System Prompt -->
          <div v-show="activePromptTab === 'emailSystem'">
            <label class="block text-sm font-medium text-white/70 mb-2">Email — System Instruction</label>
            <p class="text-xs text-white/30 mb-3">The main prompt that defines email writing behavior, rules, and company context.</p>
            <textarea
              v-model="prompts.emailSystemPrompt"
              rows="18"
              class="input-field font-mono text-xs leading-relaxed"
            />
          </div>

          <!-- LinkedIn System Prompt -->
          <div v-show="activePromptTab === 'linkedinSystem'">
            <label class="block text-sm font-medium text-white/70 mb-2">LinkedIn — System Instruction</label>
            <p class="text-xs text-white/30 mb-3">The main prompt that defines LinkedIn message writing behavior, rules, and company context.</p>
            <textarea
              v-model="prompts.linkedinSystemPrompt"
              rows="18"
              class="input-field font-mono text-xs leading-relaxed"
            />
          </div>

          <!-- Email User Prompt -->
          <div v-show="activePromptTab === 'emailUser'">
            <label class="block text-sm font-medium text-white/70 mb-2">Email — User Message (with prospect context)</label>
            <p class="text-xs text-white/30 mb-3">Sent when the extension has scraped prospect data from the current page.</p>
            <textarea
              v-model="prompts.emailUserPrompt"
              rows="6"
              class="input-field font-mono text-xs leading-relaxed"
            />
            <label class="block text-sm font-medium text-white/70 mb-2 mt-5">Email — Fallback (no context)</label>
            <p class="text-xs text-white/30 mb-3">Used when no page content is available.</p>
            <textarea
              v-model="prompts.emailNoContextPrompt"
              rows="3"
              class="input-field font-mono text-xs leading-relaxed"
            />
          </div>

          <!-- LinkedIn User Prompt -->
          <div v-show="activePromptTab === 'linkedinUser'">
            <label class="block text-sm font-medium text-white/70 mb-2">LinkedIn — User Message (with prospect context)</label>
            <p class="text-xs text-white/30 mb-3">Sent when the extension has scraped prospect data from the current page.</p>
            <textarea
              v-model="prompts.linkedinUserPrompt"
              rows="6"
              class="input-field font-mono text-xs leading-relaxed"
            />
            <label class="block text-sm font-medium text-white/70 mb-2 mt-5">LinkedIn — Fallback (no context)</label>
            <p class="text-xs text-white/30 mb-3">Used when no page content is available.</p>
            <textarea
              v-model="prompts.linkedinNoContextPrompt"
              rows="3"
              class="input-field font-mono text-xs leading-relaxed"
            />
          </div>

          <!-- Save button -->
          <button
            @click="savePrompts"
            :disabled="savingPrompts"
            class="btn-primary"
          >
            <svg v-if="savingPrompts" class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ savingPrompts ? 'Saving...' : 'Save Prompt Templates' }}
          </button>
          <p v-if="promptsSaved" class="text-sm text-green-400 mt-2">Saved!</p>
        </div>
      </SettingsCard>

      <!-- Card 3: User Management (admin only) -->
      <SettingsCard v-if="isAdmin" title="User Management" subtitle="Manage team access and roles">
        <template #icon>
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        </template>

        <div>
          <div v-if="loadingUsers" class="text-center py-8 text-white/40">Loading users...</div>
          <div v-else-if="users.length === 0" class="text-center py-8 text-white/40">No users found</div>
          <div v-else class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="border-b border-white/5">
                  <th class="text-left py-3 px-2 text-white/40 font-medium">User</th>
                  <th class="text-left py-3 px-2 text-white/40 font-medium">Email</th>
                  <th class="text-left py-3 px-2 text-white/40 font-medium">Role</th>
                  <th class="text-left py-3 px-2 text-white/40 font-medium">Last Login</th>
                  <th class="text-right py-3 px-2 text-white/40 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in users" :key="user.id" class="border-b border-white/[0.03] hover:bg-white/[0.02]">
                  <td class="py-3 px-2">
                    <div class="flex items-center gap-2">
                      <img :src="user.avatarUrl" :alt="user.name" class="w-7 h-7 rounded-full" />
                      <span class="text-white font-medium">{{ user.name }}</span>
                    </div>
                  </td>
                  <td class="py-3 px-2 text-white/50">{{ user.email }}</td>
                  <td class="py-3 px-2">
                    <select
                      :value="user.role"
                      @change="updateUserRole(user.id, ($event.target as HTMLSelectElement).value)"
                      :disabled="user.id === authStore.user?.id"
                      class="bg-navy-800 border border-white/10 rounded-md px-2 py-1 text-xs text-white/80 disabled:opacity-40"
                    >
                      <option value="admin">Admin</option>
                      <option value="regular">Regular</option>
                    </select>
                  </td>
                  <td class="py-3 px-2 text-white/40 text-xs">
                    {{ user.lastLoginAt ? formatDate(user.lastLoginAt) : 'Never' }}
                  </td>
                  <td class="py-3 px-2 text-right">
                    <button
                      v-if="user.id !== authStore.user?.id"
                      @click="confirmDeleteUser(user)"
                      class="text-red-400/60 hover:text-red-400 transition-colors text-xs"
                    >
                      Delete
                    </button>
                    <span v-else class="text-white/20 text-xs">You</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </SettingsCard>

      <!-- Card 5: Branding Reference -->
      <SettingsCard title="Branding Reference" subtitle="Extension color palette" :default-open="false">
        <template #icon>
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4.098 19.902a3.75 3.75 0 005.304 0l6.401-6.402M6.75 21A3.75 3.75 0 013 17.25V4.125C3 3.504 3.504 3 4.125 3h5.25c.621 0 1.125.504 1.125 1.125v4.072M6.75 21a3.75 3.75 0 003.75-3.75V8.197M6.75 21h13.125c.621 0 1.125-.504 1.125-1.125v-5.25c0-.621-.504-1.125-1.125-1.125h-4.072M10.5 8.197l2.88-2.88c.438-.439 1.15-.439 1.59 0l3.712 3.713c.44.44.44 1.152 0 1.59l-2.879 2.88M6.75 17.25h.008v.008H6.75v-.008z" />
          </svg>
        </template>

        <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div v-for="color in brandColors" :key="color.name" class="text-center">
            <div class="w-full h-16 rounded-xl border border-white/10 mb-2" :style="{ background: color.hex }" />
            <p class="text-xs font-medium text-white/70">{{ color.name }}</p>
            <p class="text-xs text-white/30 font-mono">{{ color.hex }}</p>
          </div>
        </div>
      </SettingsCard>

      <!-- Card 6: API Configuration (admin only) -->
      <SettingsCard v-if="isAdmin" title="API Configuration" subtitle="Gemini API key and model settings">
        <template #icon>
          <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5.25 14.25h13.5m-13.5 0a3 3 0 01-3-3m3 3a3 3 0 100 6h13.5a3 3 0 100-6m-16.5-3a3 3 0 013-3h13.5a3 3 0 013 3m-19.5 0a4.5 4.5 0 01.9-2.7L5.737 5.1a3.375 3.375 0 012.7-1.35h7.126c1.062 0 2.062.5 2.7 1.35l2.587 3.45a4.5 4.5 0 01.9 2.7m0 0a3 3 0 01-3 3m0 3h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008zm-3 6h.008v.008h-.008v-.008zm0-6h.008v.008h-.008v-.008z" />
          </svg>
        </template>

        <div class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-white/70 mb-2">Gemini API Key</label>
            <input v-model="apiConfig.geminiApiKey" type="password" placeholder="Enter your Gemini API key" class="input-field" />
          </div>
          <div>
            <label class="block text-sm font-medium text-white/70 mb-2">Model</label>
            <select v-model="apiConfig.model" class="input-field">
              <option value="gemini-2.0-flash">Gemini 2.0 Flash - Fast and capable</option>
              <option value="gemini-2.5-flash-preview-05-20">Gemini 2.5 Flash - Latest fast model (v1beta)</option>
              <option value="gemini-2.5-pro-preview-05-06">Gemini 2.5 Pro - Best quality (v1beta)</option>
              <option value="gemini-1.5-pro">Gemini 1.5 Pro - Stable pro model</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-white/70 mb-2">
              Temperature: <span class="text-brand-light">{{ apiConfig.temperature }}</span>
            </label>
            <input v-model.number="apiConfig.temperature" type="range" min="0" max="2" step="0.1" class="w-full accent-brand" />
            <div class="flex justify-between text-xs text-white/30 mt-1">
              <span>Precise (0)</span>
              <span>Creative (2)</span>
            </div>
          </div>
          <div>
            <label class="block text-sm font-medium text-white/70 mb-2">Max Tokens</label>
            <input v-model.number="apiConfig.maxTokens" type="number" min="100" max="8192" class="input-field" />
          </div>
          <button @click="saveApiConfig" :disabled="savingApiConfig" class="btn-primary">
            {{ savingApiConfig ? 'Saving...' : 'Save API Config' }}
          </button>
          <p v-if="apiConfigSaved" class="text-sm text-green-400 mt-2">API config saved successfully!</p>
        </div>
      </SettingsCard>
    </template>

    <!-- Delete confirmation modal -->
    <Teleport to="body">
      <div v-if="deleteModal.show" class="fixed inset-0 z-50 flex items-center justify-center p-4" @click.self="deleteModal.show = false">
        <div class="fixed inset-0 bg-black/60" @click="deleteModal.show = false" />
        <div class="relative bg-navy-700 border border-white/10 rounded-2xl p-6 max-w-md w-full">
          <h3 class="text-lg font-semibold text-white mb-2">Delete User</h3>
          <p class="text-sm text-white/50 mb-6">
            Are you sure you want to delete <strong class="text-white">{{ deleteModal.user?.name }}</strong>?
            This action cannot be undone.
          </p>
          <div class="flex gap-3 justify-end">
            <button @click="deleteModal.show = false" class="px-4 py-2 text-sm text-white/60 hover:text-white rounded-lg transition-colors">
              Cancel
            </button>
            <button @click="deleteUser" class="px-4 py-2 text-sm bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-colors">
              Delete
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import type { User } from '~/types/auth'

const authStore = useAuthStore()
const isAdmin = computed(() => authStore.isAdmin)

// Settings state
const loadingSettings = ref(true)
const savingPrompts = ref(false)
const savingApiConfig = ref(false)
const promptsSaved = ref(false)
const apiConfigSaved = ref(false)

// Prompt template tabs
const activePromptTab = ref('emailSystem')
const promptTabs = [
  { id: 'emailSystem', label: 'Email System' },
  { id: 'linkedinSystem', label: 'LinkedIn System' },
  { id: 'emailUser', label: 'Email User' },
  { id: 'linkedinUser', label: 'LinkedIn User' },
]
const templateVars = [
  'tone', 'maxWords', 'principles', 'angle',
  'companyName', 'companyOverview', 'painPoints', 'valueProposition',
  'competitors', 'differentiators', 'socialProof', 'callToAction',
  'additionalContext', 'prospectContext',
]
const lbrace = '{{'
const rbrace = '}}'
function wrapVar(v: string) { return lbrace + v + rbrace }

const prompts = reactive({
  principles: '',
  angles: [
    { id: 'problem-solution', name: 'Problem-Solution', prompt: '' },
    { id: 'social-proof', name: 'Social Proof', prompt: '' },
    { id: 'question-based', name: 'Question-Based', prompt: '' },
  ],
  emailMaxWords: 200,
  linkedinMaxWords: 300,
  emailSystemPrompt: '',
  linkedinSystemPrompt: '',
  emailUserPrompt: '',
  linkedinUserPrompt: '',
  emailNoContextPrompt: '',
  linkedinNoContextPrompt: '',
  businessInfoWarning: '⚠️ Please add your business information (Company Name & Value Proposition) in Settings',
})

const apiConfig = reactive({
  geminiApiKey: '',
  model: 'gemini-2.0-flash',
  temperature: 0.7,
  maxTokens: 1000,
})

// Users state
const loadingUsers = ref(false)
const users = ref<any[]>([])

// Delete modal
const deleteModal = reactive({
  show: false,
  user: null as any | null,
})

// Usage stats
const loadingUsage = ref(false)
const usagePeriod = ref('30d')
const usagePeriods = [
  { value: '7d', label: '7 Days' },
  { value: '30d', label: '30 Days' },
  { value: 'all', label: 'All Time' },
]
const usageStats = reactive({
  users: [] as Array<{
    id: string
    name: string
    email: string
    totalRequests: number
    promptTokens: number
    completionTokens: number
    totalTokens: number
    totalCost: number
    lastUsed: string | null
  }>,
  totals: {
    totalRequests: 0,
    totalTokens: 0,
    promptTokens: 0,
    completionTokens: 0,
    totalCost: 0,
  },
})

function formatCost(cost: number): string {
  if (cost === 0) return '$0.00'
  if (cost < 0.01) return `$${cost.toFixed(4)}`
  return `$${cost.toFixed(2)}`
}

async function loadUsageStats() {
  loadingUsage.value = true
  try {
    const data = await $fetch<any>(`/api/usage?period=${usagePeriod.value}`)
    usageStats.users = data.users || []
    usageStats.totals = data.totals || { totalRequests: 0, totalTokens: 0, promptTokens: 0, completionTokens: 0, totalCost: 0 }
  } catch (err) {
    console.error('Failed to load usage stats:', err)
  } finally {
    loadingUsage.value = false
  }
}

// Brand colors reference
const brandColors = [
  { name: 'Background', hex: '#080D2B' },
  { name: 'Card', hex: '#0e193d' },
  { name: 'Primary', hex: '#0241e3' },
  { name: 'Primary Light', hex: '#3366ff' },
  { name: 'Navy 800', hex: '#0a1135' },
  { name: 'Navy 600', hex: '#121f4a' },
  { name: 'Text', hex: '#e2e8f0' },
  { name: 'Text Muted', hex: '#94a3b8' },
]

// Load settings on mount
onMounted(async () => {
  try {
    const data = await $fetch<any>('/api/settings')

    if (data.prompts) {
      prompts.principles = data.prompts.principles || ''
      if (data.prompts.angles?.length) {
        prompts.angles = data.prompts.angles
      }
      prompts.emailMaxWords = data.prompts.emailMaxWords ?? 200
      prompts.linkedinMaxWords = data.prompts.linkedinMaxWords ?? 300
      prompts.emailSystemPrompt = data.prompts.emailSystemPrompt || ''
      prompts.linkedinSystemPrompt = data.prompts.linkedinSystemPrompt || ''
      prompts.emailUserPrompt = data.prompts.emailUserPrompt || ''
      prompts.linkedinUserPrompt = data.prompts.linkedinUserPrompt || ''
      prompts.emailNoContextPrompt = data.prompts.emailNoContextPrompt || ''
      prompts.linkedinNoContextPrompt = data.prompts.linkedinNoContextPrompt || ''
      prompts.businessInfoWarning = data.prompts.businessInfoWarning || '⚠️ Please add your business information (Company Name & Value Proposition) in Settings'
    }

    if (data.api_config && isAdmin.value) {
      apiConfig.geminiApiKey = data.api_config.geminiApiKey || ''
      apiConfig.model = data.api_config.model || 'gemini-2.0-flash'
      apiConfig.temperature = data.api_config.temperature ?? 0.7
      apiConfig.maxTokens = data.api_config.maxTokens ?? 1000
    }
  } catch (err) {
    console.error('Failed to load settings:', err)
  } finally {
    loadingSettings.value = false
  }

  if (isAdmin.value) {
    loadUsers()
    loadUsageStats()
  }
})

// Save prompts (includes templates)
async function savePrompts() {
  savingPrompts.value = true
  promptsSaved.value = false
  try {
    await $fetch('/api/settings', {
      method: 'POST',
      body: {
        category: 'prompts',
        data: {
          principles: prompts.principles,
          angles: prompts.angles,
          emailMaxWords: prompts.emailMaxWords,
          linkedinMaxWords: prompts.linkedinMaxWords,
          emailSystemPrompt: prompts.emailSystemPrompt,
          linkedinSystemPrompt: prompts.linkedinSystemPrompt,
          emailUserPrompt: prompts.emailUserPrompt,
          linkedinUserPrompt: prompts.linkedinUserPrompt,
          emailNoContextPrompt: prompts.emailNoContextPrompt,
          linkedinNoContextPrompt: prompts.linkedinNoContextPrompt,
          businessInfoWarning: prompts.businessInfoWarning,
        },
      },
    })
    promptsSaved.value = true
    setTimeout(() => { promptsSaved.value = false }, 3000)
  } catch (err) {
    console.error('Failed to save prompts:', err)
  } finally {
    savingPrompts.value = false
  }
}

// Save API config
async function saveApiConfig() {
  savingApiConfig.value = true
  apiConfigSaved.value = false
  try {
    await $fetch('/api/settings', {
      method: 'POST',
      body: {
        category: 'api_config',
        data: {
          geminiApiKey: apiConfig.geminiApiKey,
          model: apiConfig.model,
          temperature: apiConfig.temperature,
          maxTokens: apiConfig.maxTokens,
        },
      },
    })
    apiConfigSaved.value = true
    setTimeout(() => { apiConfigSaved.value = false }, 3000)
  } catch (err) {
    console.error('Failed to save API config:', err)
  } finally {
    savingApiConfig.value = false
  }
}

// Users management
async function loadUsers() {
  loadingUsers.value = true
  try {
    const data = await $fetch<{ users: any[] }>('/api/users')
    users.value = data.users
  } catch (err) {
    console.error('Failed to load users:', err)
  } finally {
    loadingUsers.value = false
  }
}

async function updateUserRole(userId: string, role: string) {
  try {
    await $fetch(`/api/users/${userId}`, { method: 'PATCH', body: { role } })
    const user = users.value.find(u => u.id === userId)
    if (user) user.role = role
  } catch (err) {
    console.error('Failed to update user role:', err)
  }
}

function confirmDeleteUser(user: any) {
  deleteModal.user = user
  deleteModal.show = true
}

async function deleteUser() {
  if (!deleteModal.user) return
  try {
    await $fetch(`/api/users/${deleteModal.user.id}`, { method: 'DELETE' })
    users.value = users.value.filter(u => u.id !== deleteModal.user.id)
    deleteModal.show = false
  } catch (err) {
    console.error('Failed to delete user:', err)
  }
}

function formatDate(dateStr: string) {
  try {
    const d = new Date(dateStr)
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  } catch {
    return dateStr
  }
}
</script>

<style scoped>
.input-field {
  @apply w-full bg-navy-800 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-white/25 focus:outline-none focus:border-brand/50 focus:ring-1 focus:ring-brand/30 transition-all;
}

.input-field:read-only {
  @apply opacity-60 cursor-not-allowed;
}

.input-field-sm {
  @apply bg-navy-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-white/25 focus:outline-none focus:border-brand/50 transition-all;
}

.input-field-sm:read-only {
  @apply opacity-60 cursor-not-allowed;
}

select.input-field {
  @apply appearance-none cursor-pointer;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='rgba(255,255,255,0.4)' stroke-width='2'%3E%3Cpath d='M6 9l6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  padding-right: 2.5rem;
}

.btn-primary {
  @apply inline-flex items-center gap-2 px-5 py-2.5 bg-brand hover:bg-brand-dark text-white text-sm font-medium rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed;
}
</style>
