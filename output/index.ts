import { SoftwareRenderer, GlRenderer, IRenderer, CustomRenderer } from '../Renderer';
import {
  NodeRtcEngine,
  RtcStats,
  LocalVideoStats,
  RemoteVideoStats,
  RemoteAudioStats,
  RemoteVideoTransportStats,
  RemoteAudioTransportStats,
  RemoteVideoState,
  AgoraNetworkQuality,
  LastmileProbeResult,
  ClientRoleType,
  StreamType,
  ConnectionState,
  ConnectionChangeReason,
  MediaDeviceType,
  VIDEO_PROFILE_TYPE,
  TranscodingConfig,
  InjectStreamConfig,
  VoiceChangerPreset,
  AudioReverbPreset,
  LastmileProbeConfig,
  Priority,
  CameraCapturerConfiguration,
  ScreenSymbol,
  CaptureRect,
  CaptureParam,
  VideoContentHint,
  VideoEncoderConfiguration
} from './native_type';
import { EventEmitter } from 'events';
import { deprecate } from '../Utils';

const agora = require('../../build/Release/agora_node_ext');


class AgoraRtcEngine extends EventEmitter {
  rtcEngine: NodeRtcEngine;
  streams: Map<string, IRenderer>;
  renderMode: 1 | 2 | 3;
  customRenderer: any;
  constructor() {
    super();
    this.rtcEngine = new agora.NodeRtcEngine();
    this.initEventHandler();
    this.streams = new Map();
    this.renderMode = this._checkWebGL() ? 1 : 2;
    this.customRenderer = CustomRenderer;
  }

  setRenderMode (mode: 1|2|3 = 1): void {
    this.renderMode = mode;
  }

  setCustomRenderer(customRenderer: IRenderer) {
    this.customRenderer = customRenderer;
  }

  _checkWebGL(): boolean {
    const canvas = document.createElement('canvas');
    let gl;

    canvas.width = 1;
    canvas.height = 1;

    const options = {
      alpha: false,
      depth: false,
      stencil: false,
      antialias: false,
      preferLowPowerToHighPerformance: true

    };

    try {
      gl = canvas.getContext('webgl', options) || canvas.getContext('experimental-webgl', options);
    } catch (e) {
      return false;
    }
    if (gl) {
      return true;
    } else {
      return false;
    }
  }

  initEventHandler(): void {
    const self = this;

    const fire = (event: string, ...args: Array<any>) => {
      setImmediate(() => {
        this.emit(event, ...args);
      });
    };

    this.rtcEngine.onEvent('apierror', (funcName: string) => {
      console.error(`api ${funcName} failed. this is an error
              thrown by c++ addon layer. it often means sth is
              going wrong with this function call and it refused
              to do what is asked. kindly check your parameter types
              to see if it matches properly.`);
    });

    this.rtcEngine.onEvent('joinchannel', function(channel: string, uid: number, elapsed: number) {
      fire('joinedchannel', channel, uid, elapsed);
      fire('joinedChannel', channel, uid, elapsed);
    });

    this.rtcEngine.onEvent('rejoinchannel', function(channel: string, uid: number, elapsed: number) {
      fire('rejoinedchannel', channel, uid, elapsed);
      fire('rejoinedChannel', channel, uid, elapsed);
    });

    this.rtcEngine.onEvent('warning', function(warn: number, msg: string) {
      fire('warning', warn, msg);
    });

    this.rtcEngine.onEvent('error', function(err: number, msg: string) {
      fire('error', err, msg);
    });


    this.rtcEngine.onEvent('audiovolumeindication', function(
      speakers: {
        uid: number,
        volume: number
      }[],
      speakerNumber: number,
      totalVolume: number
    ) {
      if (speakers[0]) {
        fire(
          'audiovolumeindication',
          speakers[0]['uid'],
          speakers[0]['volume'],
          speakerNumber,
          totalVolume
        );
        fire(
          'audioVolumeIndication',
          speakers[0]['uid'],
          speakers[0]['volume'],
          speakerNumber,
          totalVolume
        );
      }
      fire('groupAudioVolumeIndication', speakers, speakerNumber, totalVolume);
    });

    this.rtcEngine.onEvent('leavechannel', function() {
      fire('leavechannel');
      fire('leaveChannel');
    });

    this.rtcEngine.onEvent('rtcstats', function(stats: RtcStats) {
      fire('rtcstats', stats);
      fire('rtcStats', stats);
    });

    this.rtcEngine.onEvent('localvideostats', function(stats: LocalVideoStats) {
      fire('localvideostats', stats);
      fire('localVideoStats', stats);
    });

    this.rtcEngine.onEvent('remotevideostats', function(stats: RemoteVideoStats) {
      fire('remotevideostats', stats);
      fire('remoteVideoStats', stats);
    });

    this.rtcEngine.onEvent('remoteAudioStats', function(stats: RemoteAudioStats) {
      fire('remoteAudioStats', stats);
    });

    this.rtcEngine.onEvent('remoteAudioTransportStats', function(uid: number, delay: number, lost: number, rxKBitRate: number) {
      fire('remoteAudioTransportStats', {
        uid, delay, lost, rxKBitRate
      });
    });

    this.rtcEngine.onEvent('remoteVideoTransportStats', function(uid: number, delay: number, lost: number, rxKBitRate: number) {
      fire('remoteVideoTransportStats', {
        uid, delay, lost, rxKBitRate
      });
    });

    this.rtcEngine.onEvent('audiodevicestatechanged', function(
      deviceId: string,
      deviceType: number,
      deviceState: number,
    ) {
      fire('audiodevicestatechanged', deviceId, deviceType, deviceState);
      fire('audioDeviceStateChanged', deviceId, deviceType, deviceState);
    });


    this.rtcEngine.onEvent('audioMixingStateChanged', function(state: number, err: number) {
      fire('audioMixingStateChanged', state, err);
    });

    this.rtcEngine.onEvent('apicallexecuted', function(api: string, err: number) {
      fire('apicallexecuted', api, err);
      fire('apiCallExecuted', api, err);
    });

    this.rtcEngine.onEvent('remoteaudiomixingbegin', function() {
      fire('remoteaudiomixingbegin');
      fire('remoteAudioMixingBegin');
    });

    this.rtcEngine.onEvent('remoteaudiomixingend', function() {
      fire('remoteaudiomixingend');
      fire('remoteAudioMixingEnd');
    });

    this.rtcEngine.onEvent('audioeffectfinished', function(soundId: number) {
      fire('audioeffectfinished', soundId);
      fire('audioEffectFinished', soundId);
    });

    this.rtcEngine.onEvent('videodevicestatechanged', function(
      deviceId: string,
      deviceType: number,
      deviceState: number,
    ) {
      fire('videodevicestatechanged', deviceId, deviceType, deviceState);
      fire('videoDeviceStateChanged', deviceId, deviceType, deviceState);
    });

    this.rtcEngine.onEvent('networkquality', function(
      uid: number,
      txquality: AgoraNetworkQuality,
      rxquality: AgoraNetworkQuality
    ) {
      fire('networkquality', uid, txquality, rxquality);
      fire('networkQuality', uid, txquality, rxquality);
    });

    this.rtcEngine.onEvent('lastmilequality', function(quality: AgoraNetworkQuality) {
      fire('lastmilequality', quality);
      fire('lastMileQuality', quality);
    });

    this.rtcEngine.onEvent('lastmileProbeResult', function(result: LastmileProbeResult) {
      fire('lastmileProbeResult', result);
    });

    this.rtcEngine.onEvent('firstlocalvideoframe', function(
      width: number, height: number, elapsed: number
    ) {
      fire('firstlocalvideoframe', width, height, elapsed);
      fire('firstLocalVideoFrame', width, height, elapsed);
    });

    this.rtcEngine.onEvent('firstremotevideodecoded', function(
      uid: number,
      width: number,
      height: number,
      elapsed: number
    ) {
      fire('addstream', uid, elapsed);
      fire('addStream', uid, elapsed);
    });

    this.rtcEngine.onEvent('videosizechanged', function(
      uid: number, width: number, height: number, rotation: number
    ) {
      fire('videosizechanged', uid, width, height, rotation);
      fire('videoSizeChanged', uid, width, height, rotation);
    });

    this.rtcEngine.onEvent('firstremotevideoframe', function(
      uid: number,
      width: number,
      height: number,
      elapsed: number
    ) {
      fire('firstremotevideoframe', uid, width, height, elapsed);
      fire('firstRemoteVideoFrame', uid, width, height, elapsed);
    });

    this.rtcEngine.onEvent('userjoined', function(uid: number, elapsed: number) {
      console.log('user : ' + uid + ' joined.');
      fire('userjoined', uid, elapsed);
      fire('userJoined', uid, elapsed);
    });

    this.rtcEngine.onEvent('useroffline', function(uid: number, reason: number) {
      if (!self.streams) {
        self.streams = new Map();
        console.log('Warning!!!!!!, streams is undefined.');
        return;
      }
      self.destroyRender(uid);
      self.rtcEngine.unsubscribe(uid);
      fire('removestream', uid, reason);
      fire('removeStream', uid, reason);
    });

    this.rtcEngine.onEvent('usermuteaudio', function(uid: number, muted: boolean) {
      fire('usermuteaudio', uid, muted);
      fire('userMuteAudio', uid, muted);
    });

    this.rtcEngine.onEvent('usermutevideo', function(uid: number, muted: boolean) {
      fire('usermutevideo', uid, muted);
      fire('userMuteVideo', uid, muted);
    });

    this.rtcEngine.onEvent('userenablevideo', function(uid: number, enabled: boolean) {
      fire('userenablevideo', uid, enabled);
      fire('userEnableVideo', uid, enabled);
    });

    this.rtcEngine.onEvent('userenablelocalvideo', function(uid: number, enabled: boolean) {
      fire('userenablelocalvideo', uid, enabled);
      fire('userEnableLocalVideo', uid, enabled);
    });

    this.rtcEngine.onEvent('cameraready', function() {
      fire('cameraready');
      fire('cameraReady');
    });

    this.rtcEngine.onEvent('videostopped', function() {
      fire('videostopped');
      fire('videoStopped');
    });

    this.rtcEngine.onEvent('connectionlost', function() {
      fire('connectionlost');
      fire('connectionLost');
    });




    this.rtcEngine.onEvent('streammessage', function(
      uid: number,
      streamId: number,
      msg: string,
      len: number
    ) {
      fire('streammessage', uid, streamId, msg, len);
      fire('streamMessage', uid, streamId, msg, len);
    });

    this.rtcEngine.onEvent('streammessageerror', function(
      uid: number,
      streamId: number,
      code: number,
      missed: number,
      cached: number
    ) {
      fire('streammessageerror', uid, streamId, code, missed, cached);
      fire('streamMessageError', uid, streamId, code, missed, cached);
    });

    this.rtcEngine.onEvent('mediaenginestartcallsuccess', function() {
      fire('mediaenginestartcallsuccess');
      fire('mediaEngineStartCallSuccess');
    });

    this.rtcEngine.onEvent('requestchannelkey', function() {
      fire('requestchannelkey');
      fire('requestChannelKey');
    });

    this.rtcEngine.onEvent('fristlocalaudioframe', function(elapsed: number) {
      fire('firstlocalaudioframe', elapsed);
      fire('firstLocalAudioFrame', elapsed);
    });

    this.rtcEngine.onEvent('firstremoteaudioframe', function(uid: number, elapsed: number) {
      fire('firstremoteaudioframe', uid, elapsed);
      fire('firstRemoteAudioFrame', uid, elapsed);
    });

    this.rtcEngine.onEvent('remoteVideoStateChanged', function(uid: number, state: RemoteVideoState) {
      fire('remoteVideoStateChanged', uid, state);
    });

    this.rtcEngine.onEvent('cameraFocusAreaChanged', function(
      x: number, y: number, width: number, height: number
    ) {
      fire('cameraFocusAreaChanged', x, y, width, height);
    });

    this.rtcEngine.onEvent('cameraExposureAreaChanged', function(
      x: number, y: number, width: number, height: number
    ) {
      fire('cameraExposureAreaChanged', x, y, width, height);
    });

    this.rtcEngine.onEvent('tokenPrivilegeWillExpire', function(token: string) {
      fire('tokenPrivilegeWillExpire', token);
    });

    this.rtcEngine.onEvent('streamPublished', function(url: string, error: number) {
      fire('streamPublished', url, error);
    });

    this.rtcEngine.onEvent('streamUnpublished', function(url: string) {
      fire('streamUnpublished', url);
    });

    this.rtcEngine.onEvent('transcodingUpdated', function() {
      fire('transcodingUpdated');
    });

    this.rtcEngine.onEvent('streamInjectStatus', function(
      url: string, uid: number, status: number
    ) {
      fire('streamInjectStatus', url, uid, status);
    });

    this.rtcEngine.onEvent('localPublishFallbackToAudioOnly', function(
      isFallbackOrRecover: boolean
    ) {
      fire('localPublishFallbackToAudioOnly', isFallbackOrRecover);
    });

    this.rtcEngine.onEvent('remoteSubscribeFallbackToAudioOnly', function(
      uid: number,
      isFallbackOrRecover: boolean
    ) {
      fire('remoteSubscribeFallbackToAudioOnly', uid, isFallbackOrRecover);
    });

    this.rtcEngine.onEvent('microphoneEnabled', function(enabled: boolean) {
      fire('microphoneEnabled', enabled);
    });

    this.rtcEngine.onEvent('connectionStateChanged', function(
      state: ConnectionState,
      reason: ConnectionChangeReason
    ) {
      fire('connectionStateChanged', state, reason);
    });

    this.rtcEngine.onEvent('activespeaker', function(uid: number) {
      fire('activespeaker', uid);
      fire('activeSpeaker', uid);
    });

    this.rtcEngine.onEvent('clientrolechanged', function(oldRole: ClientRoleType, newRole: ClientRoleType) {
      fire('clientrolechanged', oldRole, newRole);
      fire('clientRoleChanged', oldRole, newRole);
    });

    this.rtcEngine.onEvent('audiodevicevolumechanged', function(
      deviceType: MediaDeviceType,
      volume: number,
      muted: boolean
    ) {
      fire('audiodevicevolumechanged', deviceType, volume, muted);
      fire('audioDeviceVolumeChanged', deviceType, volume, muted);
    });

    this.rtcEngine.onEvent('videosourcejoinsuccess', function(uid: number) {
      fire('videosourcejoinedsuccess', uid);
      fire('videoSourceJoinedSuccess', uid);
    });

    this.rtcEngine.onEvent('videosourcerequestnewtoken', function() {
      fire('videosourcerequestnewtoken');
      fire('videoSourceRequestNewToken');
    });

    this.rtcEngine.onEvent('videosourceleavechannel', function() {
      fire('videosourceleavechannel');
      fire('videoSourceLeaveChannel');
    });
    this.rtcEngine.registerDeliverFrame(function(infos: any) {
      self.onRegisterDeliverFrame(infos);
    });
  }

  _getRenderer(type: number, uid: number): IRenderer | undefined {
    if (type < 2) {
      if (uid === 0) {
        return this.streams.get('local');
      } else {
        return this.streams.get(String(uid));
      }
    } else if (type === 2) {
      console.warn('Type 2 not support in production mode.');
      return;
    } else if (type === 3) {
      return this.streams.get('videosource');
    } else {
      console.warn('Invalid type for getRenderer, only accept 0~3.');
      return;
    }
  }

  _checkData(
    header: ArrayBuffer,
    ydata: ArrayBuffer,
    udata: ArrayBuffer,
    vdata: ArrayBuffer,
  ) {
    if (header.byteLength != 20) {
      console.error('invalid image header ' + header.byteLength);
      return false;
    }
    if (ydata.byteLength === 20) {
      console.error('invalid image yplane ' + ydata.byteLength);
      return false;
    }
    if (udata.byteLength === 20) {
      console.error('invalid image uplanedata ' + udata.byteLength);
      return false;
    }
    if (
      ydata.byteLength != udata.byteLength * 4 ||
      udata.byteLength != vdata.byteLength
    ) {
      console.error(
        'invalid image header ' +
          ydata.byteLength +
          ' ' +
          udata.byteLength +
          ' ' +
          vdata.byteLength
      );
      return false;
    }

    return true;
  }

  onRegisterDeliverFrame(infos: any) {
    const len = infos.length;
    for (let i = 0; i < len; i++) {
      const info = infos[i];
      const {
        type, uid, header, ydata, udata, vdata
      } = info;
      if (!header || !ydata || !udata || !vdata) {
        console.log(
          'Invalid data param ： ' + header + ' ' + ydata + ' ' + udata + ' ' + vdata
        );
        continue;
      }
      const renderer = this._getRenderer(type, uid);
      if (!renderer) {
        console.warn("Can't find renderer for uid : " + uid);
        continue;
      }

      if (this._checkData(header, ydata, udata, vdata)) {
        renderer.drawFrame({
          header,
          yUint8Array: ydata,
          uUint8Array: udata,
          vUint8Array: vdata,
        });
      }
    }
  }

  resizeRender(key: 'local' | 'videosource' | number) {
    if (this.streams.has(String(key))) {
        const renderer = this.streams.get(String(key));
        if (renderer) {
          renderer.refreshCanvas();
      }
    }
  }

  initRender(key: 'local' | 'videosource' | number, view: Element) {
    if (this.streams.has(String(key))) {
      this.destroyRender(key);
    }
    let renderer: IRenderer;
    if (this.renderMode === 1) {
      renderer = new GlRenderer();
    } else if (this.renderMode === 2) {
      renderer = new SoftwareRenderer();
    } else if (this.renderMode === 3) {
      renderer = new this.customRenderer();
    } else {
      console.warn('Unknown render mode, fallback to 1');
      renderer = new GlRenderer();
    }
    renderer.bind(view);
    this.streams.set(String(key), renderer);
  }

  destroyRender(key: 'local' | 'videosource' | number, onFailure?: (err: Error) => void) {
    if (!this.streams.has(String(key))) {
      return;
    }
    const renderer = this.streams.get(String(key));
    try {
      (renderer as IRenderer).unbind();
      this.streams.delete(String(key));
    } catch (err) {
      onFailure && onFailure(err);
    }
  }


  initialize(appid: string): number {
    return this.rtcEngine.initialize(appid);
  }

  getVersion(): string {
    return this.rtcEngine.getVersion();
  }

  getErrorDescription(errorCode: number): string {
    return this.rtcEngine.getErrorDescription(errorCode);
  }

  getConnectionState(): ConnectionState {
    return this.rtcEngine.getConnectionState();
  }

  joinChannel(token: string, channel: string, info: string, uid: number): number {
    return this.rtcEngine.joinChannel(token, channel, info, uid);
  }

  leaveChannel(): number {
    return this.rtcEngine.leaveChannel();
  }

  release(): number {
    return this.rtcEngine.release();
  }

  setHighQualityAudioParameters(fullband: boolean, stereo: boolean, fullBitrate: boolean): number {
    deprecate('setAudioProfile');
    return this.rtcEngine.setHighQualityAudioParameters(fullband, stereo, fullBitrate);
  }

  subscribe(uid: number, view: Element): number {
    this.initRender(uid, view);
    return this.rtcEngine.subscribe(uid);
  }

  setupLocalVideo(view: Element): number {
    this.initRender('local', view);
    return this.rtcEngine.setupLocalVideo();
  }

  setVideoRenderDimension(
    rendertype: number,
    uid: number,
    width: number,
    height: number
  ) {
    this.rtcEngine.setVideoRenderDimension(rendertype, uid, width, height);
  }

  setVideoRenderFPS(fps: number) {
    this.rtcEngine.setFPS(fps);
  }

  setVideoRenderHighFPS(fps: number) {
    this.rtcEngine.setHighFPS(fps);
  }

  addVideoRenderToHighFPS(uid: number) {
    this.rtcEngine.addToHighVideo(uid);
  }

  removeVideoRenderFromHighFPS(uid: number) {
    this.rtcEngine.removeFromHighVideo(uid);
  }

  setupViewContentMode(uid: number | 'local' | 'videosource', mode: 0|1): number {
    if (this.streams.has(String(uid))) {
      const renderer = this.streams.get(String(uid));
      (renderer as IRenderer).setContentMode(mode);
      return 0;
    } else {
      return -1;
    }
  }

  renewToken(newtoken: string): number {
    return this.rtcEngine.renewToken(newtoken);
  }

  setChannelProfile(profile: number): number {
    return this.rtcEngine.setChannelProfile(profile);
  }

  setClientRole(role: ClientRoleType): number {
    return this.rtcEngine.setClientRole(role);
  }

  startEchoTest(): number {
    deprecate('startEchoTestWithInterval');
    return this.rtcEngine.startEchoTest();
  }

  stopEchoTest(): number {
    return this.rtcEngine.stopEchoTest();
  }

  startEchoTestWithInterval(interval: number): number {
    return this.rtcEngine.startEchoTestWithInterval(interval);
  }

  enableLastmileTest(): number {
    return this.rtcEngine.enableLastmileTest();
  }

  disableLastmileTest(): number {
    return this.rtcEngine.disableLastmileTest();
  }

  startLastmileProbeTest(config: LastmileProbeConfig): number {
    return this.rtcEngine.startLastmileProbeTest(config);
  }

  stopLastmileProbeTest(): number {
    return this.rtcEngine.stopLastmileProbeTest();
  }

  enableVideo(): number {
    return this.rtcEngine.enableVideo();
  }

  disableVideo(): number {
    return this.rtcEngine.disableVideo();
  }

  startPreview(): number {
    return this.rtcEngine.startPreview();
  }

  stopPreview(): number {
    return this.rtcEngine.stopPreview();
  }

  setVideoProfile(profile: VIDEO_PROFILE_TYPE, swapWidthAndHeight: boolean = false): number {
    return this.rtcEngine.setVideoProfile(profile, swapWidthAndHeight);
  }

  setCameraCapturerConfiguration(config: CameraCapturerConfiguration) {
    return this.rtcEngine.setCameraCapturerConfiguration(config);
  }

  setVideoEncoderConfiguration(config: VideoEncoderConfiguration): number {
    const {
      width = 640,
      height = 480,
      frameRate = 15,
      minFrameRate = -1,
      bitrate = 0,
      minBitrate = -1,
      orientationMode = 0,
      degradationPreference = 0
    } = config;
    return this.rtcEngine.setVideoEncoderConfiguration({
      width,
      height,
      frameRate,
      minFrameRate,
      bitrate,
      minBitrate,
      orientationMode,
      degradationPreference
    });
  }

  /** 
   * @description 所数据
   * @param {boolean} enable If to enable
   * @param {Object} options beauty options
   * @param {number} options.lighteningContrastLevel 0 for low, 1 for normal, 2 for high
   * @param {number} options.lighteningLevel The brightness level. The value ranges from 0.0 (original) to 1.0.
   * @param {number} options.smoothnessLevel The sharpness level. The value ranges between 0 (original) and 1. This parameter is usually used to remove blemishes.
   * @param {number} options.rednessLevel The redness level. The value ranges between 0 (original) and 1. This parameter adjusts the red saturation level.
   */
  setBeautyEffectOptions(enable: boolean, options: {
    lighteningContrastLevel: 0 | 1 | 2,
    lighteningLevel: number,
    smoothnessLevel: number,
    rednessLevel: number
  }): number {
    return this.rtcEngine.setBeautyEffectOptions(enable, options);
  }

  setRemoteUserPriority(uid: number, priority: Priority) {
    return this.rtcEngine.setRemoteUserPriority(uid, priority);
  }

  enableAudio(): number {
    return this.rtcEngine.enableAudio();
  }

  disableAudio(): number {
    return this.rtcEngine.disableAudio();
  }

  setAudioProfile(profile: 0|1|2|3|4|5, scenario: 0|1|2|3|4|5): number {
    return this.rtcEngine.setAudioProfile(profile, scenario);
  }

  setVideoQualityParameters(preferFrameRateOverImageQuality: boolean): number {
    return this.rtcEngine.setVideoQualityParameters(preferFrameRateOverImageQuality);
  }

  setEncryptionSecret(secret: string): number {
    return this.rtcEngine.setEncryptionSecret(secret);
  }

  muteLocalAudioStream(mute: boolean): number {
    return this.rtcEngine.muteLocalAudioStream(mute);
  }

  muteAllRemoteAudioStreams(mute: boolean): number {
    return this.rtcEngine.muteAllRemoteAudioStreams(mute);
  }

  setDefaultMuteAllRemoteAudioStreams(mute: boolean): number {
    return this.rtcEngine.setDefaultMuteAllRemoteAudioStreams(mute);
  }

  muteRemoteAudioStream(uid: number, mute: boolean): number {
    return this.rtcEngine.muteRemoteAudioStream(uid, mute);
  }

  muteLocalVideoStream(mute: boolean): number {
    return this.rtcEngine.muteLocalVideoStream(mute);
  }

  enableLocalVideo(enable: boolean): number {
    return this.rtcEngine.enableLocalVideo(enable);
  }

  enableLocalAudio(enable: boolean): number {
    return this.rtcEngine.enableLocalAudio(enable);
  }

  muteAllRemoteVideoStreams(mute: boolean): number {
    return this.rtcEngine.muteAllRemoteVideoStreams(mute);
  }

  setDefaultMuteAllRemoteVideoStreams(mute: boolean): number {
    return this.rtcEngine.setDefaultMuteAllRemoteVideoStreams(mute);
  }

  enableAudioVolumeIndication(interval: number, smooth: number): number {
    return this.rtcEngine.enableAudioVolumeIndication(interval, smooth);
  }

  muteRemoteVideoStream(uid: number, mute: boolean): number {
    return this.rtcEngine.muteRemoteVideoStream(uid, mute);
  }

  setInEarMonitoringVolume(volume: number): number {
    return this.rtcEngine.setInEarMonitoringVolume(volume);
  }

  pauseAudio() {
    deprecate('disableAudio');
    return this.rtcEngine.pauseAudio();
  }

  resumeAudio() {
    deprecate('enableAudio');
    return this.rtcEngine.resumeAudio();
  }

  setLogFile(filepath: string): number {
    return this.rtcEngine.setLogFile(filepath);
  }

  setLogFileSize(size: number): number {
    return this.rtcEngine.setLogFileSize(size);
  }

  videoSourceSetLogFile(filepath: string) {
    return this.rtcEngine.videoSourceSetLogFile(filepath);
  }

  setLogFilter(filter: number): number {
    return this.rtcEngine.setLogFilter(filter);
  }

  enableDualStreamMode(enable: boolean): number {
    return this.rtcEngine.enableDualStreamMode(enable);
  }

  setRemoteVideoStreamType(uid: number, streamType: StreamType): number {
    return this.rtcEngine.setRemoteVideoStreamType(uid, streamType);
  }

  setRemoteDefaultVideoStreamType(streamType: StreamType): number {
    return this.rtcEngine.setRemoteDefaultVideoStreamType(streamType);
  }

  enableWebSdkInteroperability(enable: boolean): number {
    return this.rtcEngine.enableWebSdkInteroperability(enable);
  }

  setLocalVideoMirrorMode(mirrortype: 0|1|2): number {
    return this.rtcEngine.setLocalVideoMirrorMode(mirrortype);
  }

  setLocalVoicePitch(pitch: number): number {
    return this.rtcEngine.setLocalVoicePitch(pitch);
  }

  setLocalVoiceEqualization(bandFrequency: number, bandGain: number): number {
    return this.rtcEngine.setLocalVoiceEqualization(bandFrequency, bandGain);
  }

  setLocalVoiceReverb(reverbKey: number, value: number): number {
    return this.rtcEngine.setLocalVoiceReverb(reverbKey, value);
  }

  setLocalVoiceChanger(preset: VoiceChangerPreset): number {
    return this.rtcEngine.setLocalVoiceChanger(preset);
  }


  setLocalVoiceReverbPreset(preset: AudioReverbPreset) {
    return this.rtcEngine.setLocalVoiceReverbPreset(preset);
  }


  setLocalPublishFallbackOption(option: 0|1|2): number {
    return this.rtcEngine.setLocalPublishFallbackOption(option);
  }

  setRemoteSubscribeFallbackOption(option: 0|1|2): number {
    return this.rtcEngine.setRemoteSubscribeFallbackOption(option);
  }

  setExternalAudioSource(enabled: boolean, samplerate: number, channels: number): number {
    return this.rtcEngine.setExternalAudioSource(enabled, samplerate, channels);
  }

  getVideoDevices(): Array<Object> {
    return this.rtcEngine.getVideoDevices();
  }

  setVideoDevice(deviceId: string): number {
    return this.rtcEngine.setVideoDevice(deviceId);
  }

  getCurrentVideoDevice(): Object {
    return this.rtcEngine.getCurrentVideoDevice();
  }

  startVideoDeviceTest(): number {
    return this.rtcEngine.startVideoDeviceTest();
  }

  stopVideoDeviceTest(): number {
    return this.rtcEngine.stopVideoDeviceTest();
  }

  getAudioPlaybackDevices(): Array<Object> {
    return this.rtcEngine.getAudioPlaybackDevices();
  }

  setAudioPlaybackDevice(deviceId: string): number {
    return this.rtcEngine.setAudioPlaybackDevice(deviceId);
  }

  getPlaybackDeviceInfo(deviceId: string, deviceName: string): number {
    return this.rtcEngine.getPlaybackDeviceInfo(deviceId, deviceName);
  }

  getCurrentAudioPlaybackDevice(): Object {
    return this.rtcEngine.getCurrentAudioPlaybackDevice();
  }

  setAudioPlaybackVolume(volume: number): number {
    return this.rtcEngine.setAudioPlaybackVolume(volume);
  }

  getAudioPlaybackVolume(): number {
    return this.rtcEngine.getAudioPlaybackVolume();
  }

  getAudioRecordingDevices(): Array<Object> {
    return this.rtcEngine.getAudioRecordingDevices();
  }

  setAudioRecordingDevice(deviceId: string): number {
    return this.rtcEngine.setAudioRecordingDevice(deviceId);
  }

  getRecordingDeviceInfo(deviceId: string, deviceName: string): number {
    return this.rtcEngine.getRecordingDeviceInfo(deviceId, deviceName);
  }

  getCurrentAudioRecordingDevice(): Object {
    return this.rtcEngine.getCurrentAudioRecordingDevice();
  }

  getAudioRecordingVolume(): number {
    return this.rtcEngine.getAudioRecordingVolume();
  }

  setAudioRecordingVolume(volume: number): number {
    return this.rtcEngine.setAudioRecordingVolume(volume);
  }

  startAudioPlaybackDeviceTest(filepath: string): number {
    return this.rtcEngine.startAudioPlaybackDeviceTest(filepath);
  }

  stopAudioPlaybackDeviceTest(): number {
    return this.rtcEngine.stopAudioPlaybackDeviceTest();
  }

  startAudioDeviceLoopbackTest(interval: number): number {
    return this.rtcEngine.startAudioDeviceLoopbackTest(interval);
  }

  stopAudioDeviceLoopbackTest(): number {
    return this.rtcEngine.stopAudioDeviceLoopbackTest();
  }

  enableLoopbackRecording(enable = false, deviceName: string | null = null): number {
    return this.rtcEngine.enableLoopbackRecording(enable, deviceName);
  }

  startAudioRecordingDeviceTest(indicateInterval: number): number {
    return this.rtcEngine.startAudioRecordingDeviceTest(indicateInterval);
  }

  stopAudioRecordingDeviceTest(): number {
    return this.rtcEngine.stopAudioRecordingDeviceTest();
  }

  getAudioPlaybackDeviceMute(): boolean {
    return this.rtcEngine.getAudioPlaybackDeviceMute();
  }

  setAudioPlaybackDeviceMute(mute: boolean): number {
    return this.rtcEngine.setAudioPlaybackDeviceMute(mute);
  }

  getAudioRecordingDeviceMute(): boolean {
    return this.rtcEngine.getAudioRecordingDeviceMute();
  }

  setAudioRecordingDeviceMute(mute: boolean): number {
    return this.rtcEngine.setAudioRecordingDeviceMute(mute);
  }

  videoSourceInitialize(appId: string): number {
    return this.rtcEngine.videoSourceInitialize(appId);
  }

  setupLocalVideoSource(view: Element): void {
    this.initRender('videosource', view);
  }

  videoSourceEnableWebSdkInteroperability(enabled: boolean): number {
    return this.rtcEngine.videoSourceEnableWebSdkInteroperability(enabled);
  }

  videoSourceJoin(
    token: string,
    cname: string,
    info: string,
    uid: number
  ): number {
    return this.rtcEngine.videoSourceJoin(token, cname, info, uid);
  }

  videoSourceLeave(): number {
    return this.rtcEngine.videoSourceLeave();
  }

  videoSourceRenewToken(token: string): number {
    return this.rtcEngine.videoSourceRenewToken(token);
  }

  videoSourceSetChannelProfile(profile: number): number {
    return this.rtcEngine.videoSourceSetChannelProfile(profile);
  }

  videoSourceSetVideoProfile(profile: VIDEO_PROFILE_TYPE, swapWidthAndHeight = false): number {
    return this.rtcEngine.videoSourceSetVideoProfile(profile, swapWidthAndHeight);
  }

  getScreenWindowsInfo(): Array<Object> {
    return this.rtcEngine.getScreenWindowsInfo();
  }

  getScreenDisplaysInfo(): Array<Object> {
    return this.rtcEngine.getScreenDisplaysInfo();
  }

  startScreenCapture2(
    windowId: number,
    captureFreq: number,
    rect: {left: number, right: number, top: number, bottom: number},
    bitrate: number
  ): number {
    deprecate('"videoSourceStartScreenCaptureByScreen" or "videoSourceStartScreenCaptureByWindow"');
    return this.rtcEngine.startScreenCapture2(windowId, captureFreq, rect, bitrate);
  }

  stopScreenCapture2(): number {
    return this.rtcEngine.stopScreenCapture2();
  }

  startScreenCapturePreview(): number {
    return this.rtcEngine.videoSourceStartPreview();
  }

  stopScreenCapturePreview(): number {
    return this.rtcEngine.videoSourceStopPreview();
  }

  videoSourceEnableDualStreamMode(enable: boolean): number {
    return this.rtcEngine.videoSourceEnableDualStreamMode(enable);
  }

  videoSourceSetParameters(parameter: string): number {
    return this.rtcEngine.videoSourceSetParameter(parameter);
  }

  videoSourceUpdateScreenCaptureRegion(rect: {
    left: number,
    right: number,
    top: number,
    bottom: number
  }) {
    return this.rtcEngine.videoSourceUpdateScreenCaptureRegion(rect);
  }

  videoSourceRelease(): number {
    return this.rtcEngine.videoSourceRelease();
  }

  videoSourceStartScreenCaptureByScreen(screenSymbol: ScreenSymbol, rect: CaptureRect, param: CaptureParam): number {
    return this.rtcEngine.videosourceStartScreenCaptureByScreen(screenSymbol, rect, param);
  }

  videoSourceStartScreenCaptureByWindow(windowSymbol: number, rect: CaptureRect, param: CaptureParam): number {
    return this.rtcEngine.videosourceStartScreenCaptureByWindow(windowSymbol, rect, param);
  }

  videoSourceUpdateScreenCaptureParameters(param: CaptureParam): number {
    return this.rtcEngine.videosourceUpdateScreenCaptureParameters(param);
  }

  videoSourceSetScreenCaptureContentHint(hint: VideoContentHint): number {
    return this.rtcEngine.videosourceSetScreenCaptureContentHint(hint);
  }



  startScreenCapture(
    windowId: number,
    captureFreq: number,
    rect: {left: number, right: number, top: number, bottom: number},
    bitrate: number
  ): number {
    deprecate();
    return this.rtcEngine.startScreenCapture(windowId, captureFreq, rect, bitrate);
  }

  stopScreenCapture(): number {
    return this.rtcEngine.stopScreenCapture();
  }

  updateScreenCaptureRegion(
    rect: {
      left: number,
      right: number,
      top: number,
      bottom: number
    }
  ): number {
    return this.rtcEngine.updateScreenCaptureRegion(rect);
  }

  startAudioMixing(
    filepath: string,
    loopback: boolean,
    replace: boolean,
    cycle: number
  ): number {
    return this.rtcEngine.startAudioMixing(filepath, loopback, replace, cycle);
  }

  stopAudioMixing(): number {
    return this.rtcEngine.stopAudioMixing();
  }

  pauseAudioMixing(): number {
    return this.rtcEngine.pauseAudioMixing();
  }

  resumeAudioMixing(): number {
    return this.rtcEngine.resumeAudioMixing();
  }

  adjustAudioMixingVolume(volume: number): number {
    return this.rtcEngine.adjustAudioMixingVolume(volume);
  }

  adjustAudioMixingPlayoutVolume(volume: number): number {
    return this.rtcEngine.adjustAudioMixingPlayoutVolume(volume);
  }

  adjustAudioMixingPublishVolume(volume: number): number {
    return this.rtcEngine.adjustAudioMixingPublishVolume(volume);
  }

  getAudioMixingDuration(): number {
    return this.rtcEngine.getAudioMixingDuration();
  }

  getAudioMixingCurrentPosition(): number {
    return this.rtcEngine.getAudioMixingCurrentPosition();
  }

  setAudioMixingPosition(position: number): number {
    return this.rtcEngine.setAudioMixingPosition(position);
  }

  addPublishStreamUrl(url: string, transcodingEnabled: boolean): number {
    return this.rtcEngine.addPublishStreamUrl(url, transcodingEnabled);
  }

  removePublishStreamUrl(url: string): number {
    return this.rtcEngine.removePublishStreamUrl(url);
  }

  setLiveTranscoding(transcoding: TranscodingConfig): number {
    return this.rtcEngine.setLiveTranscoding(transcoding);
  }

  addInjectStreamUrl(url: string, config: InjectStreamConfig): number {
    return this.rtcEngine.addInjectStreamUrl(url, config);
  }

  removeInjectStreamUrl(url: string): number {
    return this.rtcEngine.removeInjectStreamUrl(url);
  }


  setRecordingAudioFrameParameters(
    sampleRate: number,
    channel: 1|2,
    mode: 0|1|2,
    samplesPerCall: number
  ): number {
    return this.rtcEngine.setRecordingAudioFrameParameters(
      sampleRate,
      channel,
      mode,
      samplesPerCall
    );
  }

  setPlaybackAudioFrameParameters(
    sampleRate: number,
    channel: 1|2,
    mode: 0|1|2,
    samplesPerCall: number
  ): number {
    return this.rtcEngine.setPlaybackAudioFrameParameters(
      sampleRate,
      channel,
      mode,
      samplesPerCall
    );
  }

  setMixedAudioFrameParameters(
    sampleRate: number,
    samplesPerCall: number
  ): number {
    return this.rtcEngine.setMixedAudioFrameParameters(sampleRate, samplesPerCall);
  }

  createDataStream(reliable: boolean, ordered: boolean): number {
    return this.rtcEngine.createDataStream(reliable, ordered);
  }

  sendStreamMessage(streamId: number, msg: string): number {
    return this.rtcEngine.sendStreamMessage(streamId, msg);
  }

  getEffectsVolume(): number {
    return this.rtcEngine.getEffectsVolume();
  }
  setEffectsVolume(volume: number): number {
    return this.rtcEngine.setEffectsVolume(volume);
  }
  setVolumeOfEffect(soundId: number, volume: number): number {
    return this.rtcEngine.setVolumeOfEffect(soundId, volume);
  }
  playEffect(
    soundId: number,
    filePath: string,
    loopcount: number,
    pitch: number,
    pan: number,
    gain: number,
    publish: number
  ): number {
    return this.rtcEngine.playEffect(
      soundId,
      filePath,
      loopcount,
      pitch,
      pan,
      gain,
      publish
    );
  }
  stopEffect(soundId: number): number {
    return this.rtcEngine.stopEffect(soundId);
  }
  preloadEffect(soundId: number, filePath: string): number {
    return this.rtcEngine.preloadEffect(soundId, filePath);
  }
  unloadEffect(soundId: number): number {
    return this.rtcEngine.unloadEffect(soundId);
  }
  pauseEffect(soundId: number): number {
    return this.rtcEngine.pauseEffect(soundId);
  }
  pauseAllEffects(): number {
    return this.rtcEngine.pauseAllEffects();
  }
  resumeEffect(soundId: number): number {
    return this.rtcEngine.resumeEffect(soundId);
  }
  resumeAllEffects(): number {
    return this.rtcEngine.resumeAllEffects();
  }

  enableSoundPositionIndication(enable: boolean) {
    return this.rtcEngine.enableSoundPositionIndication(enable);
  }

  setRemoteVoicePosition(uid: number, pan: number, gain: number): number {
    return this.rtcEngine.setRemoteVoicePosition(uid, pan, gain);
  }



  getCallId(): string {
    return this.rtcEngine.getCallId();
  }

  rate(callId: string, rating: number, desc: string): number {
    return this.rtcEngine.rate(callId, rating, desc);
  }

  complain(callId: string, desc: string): number {
    return this.rtcEngine.complain(callId, desc);
  }

  setBool(key: string, value: boolean): number {
    return this.rtcEngine.setBool(key, value);
  }

  setInt(key: string, value: number): number {
    return this.rtcEngine.setInt(key, value);
  }

  setUInt(key: string, value: number): number {
    return this.rtcEngine.setUInt(key, value);
  }

  setNumber(key: string, value: number): number {
    return this.rtcEngine.setNumber(key, value);
  }

  setString(key: string, value: string): number {
    return this.rtcEngine.setString(key, value);
  }

  setObject(key: string, value: string): number {
    return this.rtcEngine.setObject(key, value);
  }

  getBool(key: string): boolean {
    return this.rtcEngine.getBool(key);
  }

  getInt(key: string): number {
    return this.rtcEngine.getInt(key);
  }

  getUInt(key: string): number {
    return this.rtcEngine.getUInt(key);
  }

  getNumber(key: string): number {
    return this.rtcEngine.getNumber(key);
  }

  getString(key: string): string {
    return this.rtcEngine.getString(key);
  }

  getObject(key: string): string {
    return this.rtcEngine.getObject(key);
  }

  getArray(key: string): string {
    return this.rtcEngine.getArray(key);
  }

  setParameters(param: string): number {
    return this.rtcEngine.setParameters(param);
  }

  convertPath(path: string): string {
    return this.rtcEngine.convertPath(path);
  }

  setProfile(profile: string, merge: boolean): number {
    return this.rtcEngine.setProfile(profile, merge);
  }
}

declare interface AgoraRtcEngine {
  on(evt: 'apiCallExecuted', cb: (api: string, err: number) => void): this;
  on(evt: 'warning', cb: (warn: number, msg: string) => void): this;
  on(evt: 'error', cb: (err: number, msg: string) => void): this;
  on(evt: 'joinedChannel', cb: (
    channel: string, uid: number, elapsed: number
  ) => void): this;
  on(evt: 'rejoinedChannel', cb: (
    channel: string, uid: number, elapsed: number
  ) => void): this;
  on(evt: 'audioVolumeIndication', cb: (
    uid: number,
    volume: number,
    speakerNumber: number,
    totalVolume: number
  ) => void): this;
  on(evt: 'groupAudioVolumeIndication', cb: (
    speakers: {
      uid: number,
      volume: number
    }[],
    speakerNumber: number,
    totalVolume: number
  ) => void): this;
  on(evt: 'leaveChannel', cb: () => void): this;
  on(evt: 'rtcStats', cb: (stats: RtcStats) => void): this;
  on(evt: 'localVideoStats', cb: (stats: LocalVideoStats) => void): this;
  on(evt: 'remoteVideoStats', cb: (stats: RemoteVideoStats) => void): this;
  on(evt: 'remoteAudioStats', cb: (stats: RemoteAudioStats) => void): this;
  on(evt: 'remoteVideoTransportStats', cb: (stats: RemoteVideoTransportStats) => void): this;
  on(evt: 'remoteAudioTransportStats', cb: (stats: RemoteAudioTransportStats) => void): this;
  on(evt: 'audioDeviceStateChanged', cb: (
    deviceId: string,
    deviceType: number,
    deviceState: number,
  ) => void): this;
  on(evt: 'audioMixingStateChanged', cb: (state: number, err: number) => void): this;
  on(evt: 'remoteAudioMixingBegin', cb: () => void): this;
  on(evt: 'remoteAudioMixingEnd', cb: () => void): this;
  on(evt: 'audioEffectFinished', cb: (soundId: number) => void): this;
  on(evt: 'videoDeviceStateChanged', cb: (
    deviceId: string,
    deviceType: number,
    deviceState: number,
  ) => void): this;
  on(evt: 'networkQuality', cb: (
    uid: number,
    txquality: AgoraNetworkQuality,
    rxquality: AgoraNetworkQuality
  ) => void): this;
  on(evt: 'lastMileQuality', cb: (quality: AgoraNetworkQuality) => void): this;
  on(evt: 'lastmileProbeResult', cb: (result: LastmileProbeResult) => void): this;
  on(evt: 'firstLocalVideoFrame', cb: (
    width: number,
    height: number,
    elapsed: number
  ) => void): this;
  on(evt: 'addStream', cb: (
    uid: number,
    elapsed: number,
  ) => void): this;
  on(evt: 'videoSizeChanged', cb: (
    uid: number,
    width: number,
    height: number,
    rotation: number
  ) => void): this;
  on(evt: 'firstRemoteVideoFrame', cb: (
    uid: number,
    width: number,
    height: number,
    elapsed: number
  ) => void): this;
  on(evt: 'userJoined', cb: (uid: number, elapsed: number) => void): this;
  on(evt: 'removeStream', cb: (uid: number, reason: number) => void): this;
  on(evt: 'userMuteAudio', cb: (uid: number, muted: boolean) => void): this;
  on(evt: 'userMuteVideo', cb: (uid: number, muted: boolean) => void): this;
  on(evt: 'userEnableVideo', cb: (uid: number, enabled: boolean) => void): this;
  on(evt: 'userEnableLocalVideo', cb: (uid: number, enabled: boolean) => void): this;
  on(evt: 'cameraReady', cb: () => void): this;
  on(evt: 'videoStopped', cb: () => void): this;
  on(evt: 'connectionLost', cb: () => void): this;
  on(evt: 'connectionBanned', cb: () => void): this;
  on(evt: 'streamMessage', cb: (
    uid: number,
    streamId: number,
    msg: string,
    len: number
  ) => void): this;
  on(evt: 'streamMessageError', cb: (
    uid: number,
    streamId: number,
    code: number,
    missed: number,
    cached: number
  ) => void): this;
  on(evt: 'mediaEngineStartCallSuccess', cb: () => void): this;
  on(evt: 'requestChannelKey', cb: () => void): this;
  on(evt: 'fristLocalAudioFrame', cb: (elapsed: number) => void): this;
  on(evt: 'firstRemoteAudioFrame', cb: (uid: number, elapsed: number) => void): this;
  on(evt: 'activeSpeaker', cb: (uid: number) => void): this;
  on(evt: 'clientRoleChanged', cb: (
    oldRole: ClientRoleType,
    newRole: ClientRoleType
  ) => void): this;
  on(evt: 'audioDeviceVolumeChanged', cb: (
    deviceType: MediaDeviceType,
    volume: number,
    muted: boolean
  ) => void): this;
  on(evt: 'videoSourceJoinedSuccess', cb: (uid: number) => void): this;
  on(evt: 'videoSourceRequestNewToken', cb: () => void): this;
  on(evt: 'videoSourceLeaveChannel', cb: () => void): this;

  on(evt: 'remoteVideoStateChanged', cb: (uid: number, state: RemoteVideoState) => void): this;
  on(evt: 'cameraFocusAreaChanged', cb: (x: number, y: number, width: number, height: number) => void): this;
  on(evt: 'cameraExposureAreaChanged', cb: (x: number, y: number, width: number, height: number) => void): this;
  on(evt: 'tokenPrivilegeWillExpire', cb: (token: string) => void): this;
  on(evt: 'streamPublished', cb: (url: string, error: number) => void): this;
  on(evt: 'streamUnpublished', cb: (url: string) => void): this;
  on(evt: 'transcodingUpdated', cb: () => void): this;
  on(evt: 'streamInjectStatus', cb: (url: string, uid: number, status: number) => void): this;
  on(evt: 'localPublishFallbackToAudioOnly', cb: (isFallbackOrRecover: boolean) => void): this;
  on(evt: 'remoteSubscribeFallbackToAudioOnly', cb: (
    uid: number,
    isFallbackOrRecover: boolean
  ) => void): this;
  on(evt: 'microphoneEnabled', cb: (enabled: boolean) => void): this;
  on(evt: 'connectionStateChanged', cb: (
    state: ConnectionState,
    reason: ConnectionChangeReason
  ) => void): this;
  on(evt: string, listener: Function): this;

}

export default AgoraRtcEngine;
