export type AgoraNetworkQuality =
  | 0 
  | 1 
  | 2 
  | 3 
  | 4 
  | 5 
  | 6; 

export type ClientRoleType = 1 | 2;

export type StreamType = 0 | 1;

export type MediaDeviceType =
  | -1 
  | 0 
  | 1 
  | 2 
  | 3 
  | 4; 

export interface TranscodingUser {
  uid: number;
  x: number;
  y: number;
  width: number;
  height: number;
  zOrder: number;
  alpha: number;
  audioChannel: number;
}

export interface TranscodingConfig {
  width: number;
  height: number;
  videoBitrate: number;
  videoFrameRate: number;
  lowLatency: boolean;
  videoGop: number;
  videoCodecProfile: number;
  backgroundColor: number;
  userCount: number;
  audioSampleRate: number;
  audioChannels: number;
  watermark: {
    url: string;
    x: number;
    y: number;
    width: number;
    height: number;
  };
  transcodingUsers: Array<TranscodingUser>;
}

export interface LastmileProbeConfig {
  probeUplink: boolean;
  probeDownlink: boolean;
  expectedUplinkBitrate: number;
  expectedDownlinkBitrate: number;
}

export interface LastmileProbeOneWayResult {
  packetLossRate: number;
  jitter: number;
  availableBandwidth: number;
}

export interface LastmileProbeResult {
  state: number;
  uplinkReport: LastmileProbeOneWayResult;
  downlinkReport: LastmileProbeOneWayResult;
  rtt: number;
}

export enum VoiceChangerPreset {
  VOICE_CHANGER_OFF = 0,
  VOICE_CHANGER_OLDMAN = 1,
  VOICE_CHANGER_BABYBOY = 2,
  VOICE_CHANGER_BABYGIRL = 3,
  VOICE_CHANGER_ZHUBAJIE = 4,
  VOICE_CHANGER_ETHEREAL = 5,
  VOICE_CHANGER_HULK = 6
}

export enum AudioReverbPreset {
  AUDIO_REVERB_OFF = 0, 
  AUDIO_REVERB_POPULAR = 1,
  AUDIO_REVERB_RNB = 2,
  AUDIO_REVERB_ROCK = 3,
  AUDIO_REVERB_HIPHOP = 4,
  AUDIO_REVERB_VOCAL_CONCERT = 5,
  AUDIO_REVERB_KTV = 6,
  AUDIO_REVERB_STUDIO = 7
}

export interface InjectStreamConfig {
  width: number;
  height: number;
  videoBitrate: number;
  videoFrameRate: number;
  videoGop: number;
  audioSampleRate: number;
  audioBitrate: number;
  audioChannels: number;
}

export enum Priority {
  PRIORITY_HIGH = 50,
  PRIORITY_NORMAL = 100
}

export interface RtcStats {
  duration: number;
  txBytes: number;
  rxBytes: number;
  txKBitRate: number;
  rxKBitRate: number;
  rxAudioKBitRate: number;
  txAudioKBitRate: number;
  rxVideoKBitRate: number;
  txVideoKBitRate: number;
  userCount: number;
  cpuAppUsage: number;
  cpuTotalUsage: number;
}

export enum QualityAdaptIndication {
  ADAPT_NONE = 0,
  ADAPT_UP_BANDWIDTH = 1,
  ADAPT_DOWN_BANDWIDTH = 2,
}

export interface LocalVideoStats {
  sentBitrate: number;
  sentFrameRate: number;
  targetBitrate: number;
  targetFrameRate: number;
  qualityAdaptIndication: QualityAdaptIndication;
}

export interface VideoEncoderConfiguration {
  width: number;
  height: number;
  frameRate: number; 
  minFrameRate: number; 
  bitrate: number; 
  minBitrate: number; 
  orientationMode: OrientationMode;
  degradationPreference: DegradationPreference;
}

export enum DegradationPreference {
  MAINTAIN_QUALITY = 0,
  MAINTAIN_FRAMERATE = 1,
  MAINTAIN_BALANCED = 2,
}


export enum OrientationMode  {
  ORIENTATION_MODE_ADAPTIVE = 0, 
  ORIENTATION_MODE_FIXED_LANDSCAPE = 1, 
  ORIENTATION_MODE_FIXED_PORTRAIT = 2, 
}

export interface RemoteVideoStats {
  uid: number;
  delay: number;
  width: number;
  height: number;
  receivedBitrate: number;
  rendererOutputFrameRate: number;
  rxStreamType: StreamType;
}

export enum CaptureOutPreference {
  CAPTURER_OUTPUT_PREFERENCE_AUTO = 0,
  CAPTURER_OUTPUT_PREFERENCE_PERFORMANCE = 1,
  CAPTURER_OUTPUT_PREFERENCE_PREVIEW = 2
}

export interface CameraCapturerConfiguration {
  preference: CaptureOutPreference;
}

export interface Rectangle {
  x: number; 
  y: number; 
  width: number; 
  height: number; 
}

export type ScreenSymbol = MacScreenSymbol | WindowsScreenSymbol;

export type MacScreenSymbol = number;

export type WindowsScreenSymbol = Rectangle;

export type CaptureRect = Rectangle;

export interface CaptureParam {
  width: number; 
  height: number; 
  frameRate: number; 
  bitrate: number; 
}

export enum VideoContentHint {
  CONTENT_HINT_NONE = 0, 
  CONTENT_HINT_MOTION = 1, 
  CONTENT_HINT_DETAILS = 2 
}

export interface RemoteVideoTransportStats {
  uid: number;
  delay: number;
  lost: number;
  rxKBitRate: number;
}

export interface RemoteAudioTransportStats {
  uid: number;
  delay: number;
  lost: number;
  rxKBitRate: number;
}

export interface RemoteAudioStats {
  uid: number;
  quality: number;
  networkTransportDelay: number;
  jitterBufferDelay: number;
  audioLossRate: number;
}

export type RemoteVideoState =
  | 1 
  | 2; 

export type ConnectionState =
  | 1 
  | 2 
  | 3 
  | 4 
  | 5; 

export type ConnectionChangeReason =
  | 0 
  | 1 
  | 2 
  | 3 
  | 4 
  | 5; 

export enum VIDEO_PROFILE_TYPE {
  VIDEO_PROFILE_LANDSCAPE_120P = 0,
  VIDEO_PROFILE_LANDSCAPE_120P_3 = 2,
  VIDEO_PROFILE_LANDSCAPE_180P = 10,
  VIDEO_PROFILE_LANDSCAPE_180P_3 = 12,
  VIDEO_PROFILE_LANDSCAPE_180P_4 = 13,
  VIDEO_PROFILE_LANDSCAPE_240P = 20,
  VIDEO_PROFILE_LANDSCAPE_240P_3 = 22,
  VIDEO_PROFILE_LANDSCAPE_240P_4 = 23,
  VIDEO_PROFILE_LANDSCAPE_360P = 30,
  VIDEO_PROFILE_LANDSCAPE_360P_3 = 32,
  VIDEO_PROFILE_LANDSCAPE_360P_4 = 33,
  VIDEO_PROFILE_LANDSCAPE_360P_6 = 35,
  VIDEO_PROFILE_LANDSCAPE_360P_7 = 36,
  VIDEO_PROFILE_LANDSCAPE_360P_8 = 37,
  VIDEO_PROFILE_LANDSCAPE_360P_9 = 38,
  VIDEO_PROFILE_LANDSCAPE_360P_10 = 39,
  VIDEO_PROFILE_LANDSCAPE_360P_11 = 100,
  VIDEO_PROFILE_LANDSCAPE_480P = 40,
  VIDEO_PROFILE_LANDSCAPE_480P_3 = 42,
  VIDEO_PROFILE_LANDSCAPE_480P_4 = 43,
  VIDEO_PROFILE_LANDSCAPE_480P_6 = 45,
  VIDEO_PROFILE_LANDSCAPE_480P_8 = 47,
  VIDEO_PROFILE_LANDSCAPE_480P_9 = 48,
  VIDEO_PROFILE_LANDSCAPE_480P_10 = 49,
  VIDEO_PROFILE_LANDSCAPE_720P = 50,
  VIDEO_PROFILE_LANDSCAPE_720P_3 = 52,
  VIDEO_PROFILE_LANDSCAPE_720P_5 = 54,
  VIDEO_PROFILE_LANDSCAPE_720P_6 = 55,
  VIDEO_PROFILE_LANDSCAPE_1080P = 60,
  VIDEO_PROFILE_LANDSCAPE_1080P_3 = 62,
  VIDEO_PROFILE_LANDSCAPE_1080P_5 = 64,
  VIDEO_PROFILE_LANDSCAPE_1440P = 66,
  VIDEO_PROFILE_LANDSCAPE_1440P_2 = 67,
  VIDEO_PROFILE_LANDSCAPE_4K = 70,
  VIDEO_PROFILE_LANDSCAPE_4K_3 = 72,
  VIDEO_PROFILE_PORTRAIT_120P = 1000,
  VIDEO_PROFILE_PORTRAIT_120P_3 = 1002,
  VIDEO_PROFILE_PORTRAIT_180P = 1010,
  VIDEO_PROFILE_PORTRAIT_180P_3 = 1012,
  VIDEO_PROFILE_PORTRAIT_180P_4 = 1013,
  VIDEO_PROFILE_PORTRAIT_240P = 1020,
  VIDEO_PROFILE_PORTRAIT_240P_3 = 1022,
  VIDEO_PROFILE_PORTRAIT_240P_4 = 1023,
  VIDEO_PROFILE_PORTRAIT_360P = 1030,
  VIDEO_PROFILE_PORTRAIT_360P_3 = 1032,
  VIDEO_PROFILE_PORTRAIT_360P_4 = 1033,
  VIDEO_PROFILE_PORTRAIT_360P_6 = 1035,
  VIDEO_PROFILE_PORTRAIT_360P_7 = 1036,
  VIDEO_PROFILE_PORTRAIT_360P_8 = 1037,
  VIDEO_PROFILE_PORTRAIT_360P_9 = 1038,
  VIDEO_PROFILE_PORTRAIT_360P_10 = 1039,
  VIDEO_PROFILE_PORTRAIT_360P_11 = 1100,
  VIDEO_PROFILE_PORTRAIT_480P = 1040,
  VIDEO_PROFILE_PORTRAIT_480P_3 = 1042,
  VIDEO_PROFILE_PORTRAIT_480P_4 = 1043,
  VIDEO_PROFILE_PORTRAIT_480P_6 = 1045,
  VIDEO_PROFILE_PORTRAIT_480P_8 = 1047,
  VIDEO_PROFILE_PORTRAIT_480P_9 = 1048,
  VIDEO_PROFILE_PORTRAIT_480P_10 = 1049,
  VIDEO_PROFILE_PORTRAIT_720P = 1050,
  VIDEO_PROFILE_PORTRAIT_720P_3 = 1052,
  VIDEO_PROFILE_PORTRAIT_720P_5 = 1054,
  VIDEO_PROFILE_PORTRAIT_720P_6 = 1055,
  VIDEO_PROFILE_PORTRAIT_1080P = 1060,
  VIDEO_PROFILE_PORTRAIT_1080P_3 = 1062,
  VIDEO_PROFILE_PORTRAIT_1080P_5 = 1064,
  VIDEO_PROFILE_PORTRAIT_1440P = 1066,
  VIDEO_PROFILE_PORTRAIT_1440P_2 = 1067,
  VIDEO_PROFILE_PORTRAIT_4K = 1070,
  VIDEO_PROFILE_PORTRAIT_4K_3 = 1072,
  VIDEO_PROFILE_DEFAULT = VIDEO_PROFILE_LANDSCAPE_360P
}

export interface NodeRtcEngine {
  initialize(appId: string): number;
  getVersion(): string;
  getErrorDescription(errorCode: number): string;
  getConnectionState(): ConnectionState;
  joinChannel(
    token: string,
    channel: string,
    info: string,
    uid: number
  ): number;
  leaveChannel(): number;
  release(): number;
  setHighQualityAudioParameters(
    fullband: boolean,
    stereo: boolean,
    fullBitrate: boolean
  ): number;
  setupLocalVideo(): number;
  subscribe(uid: number): number;
  setVideoRenderDimension(
    rendertype: number,
    uid: number,
    width: number,
    height: number
  ): void;
  setFPS(fps: number): void;
  setHighFPS(fps: number): void;
  addToHighVideo(uid: number): void;
  removeFromHighVideo(uid: number): void;
  renewToken(newToken: string): number;
  setChannelProfile(profile: number): number;
  setClientRole(role: ClientRoleType): number;
  startEchoTest(): number;
  stopEchoTest(): number;
  startEchoTestWithInterval(interval: number): number;
  enableLastmileTest(): number;
  disableLastmileTest(): number;
  startLastmileProbeTest(config: LastmileProbeConfig): number;
  stopLastmileProbeTest(): number;
  enableVideo(): number;
  disableVideo(): number;
  startPreview(): number;
  stopPreview(): number;
  setVideoProfile(
    profile: VIDEO_PROFILE_TYPE,
    swapWidthAndHeight: boolean
  ): number;
  setCameraCapturerConfiguration(config: CameraCapturerConfiguration): number;
  setVideoEncoderConfiguration(
    config: VideoEncoderConfiguration
  ): number;
  setBeautyEffectOptions(
    enable: boolean,
    options: {
      lighteningContrastLevel: 0 | 1 | 2; 
      lighteningLevel: number,
      smoothnessLevel: number,
      rednessLevel: number
    }
  ): number;
  setRemoteUserPriority(uid: number, priority: Priority): number;
  enableAudio(): number;
  disableAudio(): number;
  setAudioProfile(profile: number, scenario: number): number;
  setVideoQualityParameters(preferFrameRateOverImageQuality: boolean): number;
  setEncryptionSecret(secret: string): number;
  muteLocalAudioStream(mute: boolean): number;
  muteAllRemoteAudioStreams(mute: boolean): number;
  setDefaultMuteAllRemoteAudioStreams(mute: boolean): number;
  muteRemoteAudioStream(uid: number, mute: boolean): number;
  muteLocalVideoStream(mute: boolean): number;
  enableLocalVideo(enable: boolean): number;
  enableLocalAudio(enable: boolean): number;
  muteAllRemoteVideoStreams(mute: boolean): number;
  setDefaultMuteAllRemoteVideoStreams(mute: boolean): number;
  enableAudioVolumeIndication(interval: number, smooth: number): number;
  muteRemoteVideoStream(uid: number, mute: boolean): number;
  setInEarMonitoringVolume(volume: number): number;
  pauseAudio(): number;
  resumeAudio(): number;
  setLogFile(filepath: string): number;
  setLogFileSize(size: number): number;
  videoSourceSetLogFile(filepath: string): number;
  setLogFilter(filter: number): number;
  enableDualStreamMode(enable: boolean): number;
  setRemoteVideoStreamType(uid: number, streamType: StreamType): number;
  setRemoteDefaultVideoStreamType(streamType: StreamType): number;
  enableWebSdkInteroperability(enable: boolean): number;
  setLocalVideoMirrorMode(mirrorType: 0 | 1 | 2): number;
  setLocalVoicePitch(pitch: number): number;
  setLocalVoiceEqualization(bandFrequency: number, bandGain: number): number;
  setLocalVoiceReverb(reverbKey: number, value: number): number;
  setLocalVoiceChanger(preset: VoiceChangerPreset): number;
  setLocalVoiceReverbPreset(preset: AudioReverbPreset): number;
  setLocalPublishFallbackOption(option: 0 | 1 | 2): number;
  setRemoteSubscribeFallbackOption(option: 0 | 1 | 2): number;
  setExternalAudioSource(
    enabled: boolean,
    samplerate: number,
    channels: number
  ): number;
  getVideoDevices(): Array<Object>;
  setVideoDevice(deviceId: string): number;
  getCurrentVideoDevice(): Object;
  startVideoDeviceTest(): number;
  stopVideoDeviceTest(): number;
  getAudioPlaybackDevices(): Array<Object>;
  setAudioPlaybackDevice(deviceId: string): number;
  getPlaybackDeviceInfo(deviceId: string, deviceName: string): number;
  getCurrentAudioPlaybackDevice(): Object;
  setAudioPlaybackVolume(volume: number): number;
  getAudioPlaybackVolume(): number;
  getAudioRecordingDevices(): Array<Object>;
  setAudioRecordingDevice(deviceId: string): number;
  getRecordingDeviceInfo(deviceId: string, deviceName: string): number;
  getCurrentAudioRecordingDevice(): Object;
  getAudioRecordingVolume(): number;
  setAudioRecordingVolume(volume: number): number;
  startAudioPlaybackDeviceTest(filepath: string): number;
  stopAudioPlaybackDeviceTest(): number;
  enableLoopbackRecording(enable: boolean, deviceName: string | null): number;
  startAudioRecordingDeviceTest(indicateInterval: number): number;
  stopAudioRecordingDeviceTest(): number;
  startAudioDeviceLoopbackTest(interval: number): number;
  stopAudioDeviceLoopbackTest(): number;
  getAudioPlaybackDeviceMute(): boolean;
  setAudioPlaybackDeviceMute(mute: boolean): number;
  getAudioRecordingDeviceMute(): boolean;
  setAudioRecordingDeviceMute(mute: boolean): number;
  videoSourceInitialize(appId: string): number;
  videoSourceEnableWebSdkInteroperability(enabled: boolean): number;
  videoSourceJoin(
    token: string,
    cname: string,
    info: string,
    uid: number
  ): number;
  videoSourceLeave(): number;
  videoSourceRenewToken(token: string): number;
  videoSourceSetChannelProfile(profile: number): number;
  videoSourceSetVideoProfile(
    profile: VIDEO_PROFILE_TYPE,
    swapWidthAndHeight: boolean
  ): number;
  videosourceStartScreenCaptureByScreen(screenSymbol: ScreenSymbol, rect: CaptureRect, param: CaptureParam): number;
  videosourceStartScreenCaptureByWindow(windowSymbol: number, rect: CaptureRect, param: CaptureParam): number;
  videosourceUpdateScreenCaptureParameters(param: CaptureParam): number;
  videosourceSetScreenCaptureContentHint(hint: VideoContentHint): number;
  getScreenWindowsInfo(): Array<Object>;
  getScreenDisplaysInfo(): Array<Object>;
  startScreenCapture2(
    windowId: number,
    captureFreq: number,
    rect: { left: number; right: number; top: number; bottom: number },
    bitrate: number
  ): number;
  stopScreenCapture2(): number;
  videoSourceStartPreview(): number;
  videoSourceStopPreview(): number;
  videoSourceEnableDualStreamMode(enable: boolean): number;
  videoSourceSetParameter(parameter: string): number;
  videoSourceUpdateScreenCaptureRegion(rect: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  }): number;
  videoSourceRelease(): number;
  startScreenCapture(
    windowId: number,
    captureFreq: number,
    rect: { left: number; right: number; top: number; bottom: number },
    bitrate: number
  ): number;
  stopScreenCapture(): number;
  updateScreenCaptureRegion(rect: {
    left: number;
    right: number;
    top: number;
    bottom: number;
  }): number;
  startAudioMixing(
    filepath: string,
    loopback: boolean,
    replace: boolean,
    cycle: number
  ): number;
  stopAudioMixing(): number;
  pauseAudioMixing(): number;
  resumeAudioMixing(): number;
  adjustAudioMixingVolume(volume: number): number;
  adjustAudioMixingPlayoutVolume(volume: number): number;
  adjustAudioMixingPublishVolume(volume: number): number;
  getAudioMixingDuration(): number;
  getAudioMixingCurrentPosition(): number;
  setAudioMixingPosition(position: number): number;
  addPublishStreamUrl(url: string, transcodingEnabled: boolean): number;
  removePublishStreamUrl(url: string): number;
  setLiveTranscoding(transcoding: TranscodingConfig): number;
  addInjectStreamUrl(url: string, config: InjectStreamConfig): number;
  removeInjectStreamUrl(url: string): number;

  setRecordingAudioFrameParameters(
    sampleRate: number,
    channel: 1 | 2,
    mode: 0 | 1 | 2,
    samplesPerCall: number
  ): number;
  setPlaybackAudioFrameParameters(
    sampleRate: number,
    channel: 1 | 2,
    mode: 0 | 1 | 2,
    samplesPerCall: number
  ): number;
  setMixedAudioFrameParameters(
    sampleRate: number,
    samplesPerCall: number
  ): number;
  createDataStream(reliable: boolean, ordered: boolean): number;
  sendStreamMessage(streamId: number, msg: string): number;
  getEffectsVolume(): number;
  setEffectsVolume(volume: number): number;
  setVolumeOfEffect(soundId: number, volume: number): number;
  playEffect(
    soundId: number,
    filePath: string,
    loopcount: number,
    pitch: number,
    pan: number,
    gain: number,
    publish: number
  ): number;
  stopEffect(soundId: number): number;
  preloadEffect(soundId: number, filePath: string): number;
  unloadEffect(soundId: number): number;
  pauseEffect(soundId: number): number;
  pauseAllEffects(): number;
  resumeEffect(soundId: number): number;
  resumeAllEffects(): number;
  enableSoundPositionIndication(enable: boolean): number;
  setRemoteVoicePosition(uid: number, pan: number, gain: number): number;
  getCallId(): string;
  rate(callId: string, rating: number, desc: string): number;
  complain(callId: string, desc: string): number;
  setBool(key: string, value: boolean): number;
  setInt(key: string, value: number): number;
  setUInt(key: string, value: number): number;
  setNumber(key: string, value: number): number;
  setString(key: string, value: string): number;
  setObject(key: string, value: string): number;
  getBool(key: string): boolean;
  getInt(key: string): number;
  getUInt(key: string): number;
  getNumber(key: string): number;
  getString(key: string): string;
  getObject(key: string): string;
  getArray(key: string): string;
  setParameters(param: string): number;
  convertPath(path: string): string;
  setProfile(profile: string, merge: boolean): number;
  onEvent(event: string, callback: Function): void;
  unsubscribe(uid: number): number;
  registerDeliverFrame(callback: Function): number;
}
