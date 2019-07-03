/** @zh-cn
 * 网络质量：
 * - 0：质量未知
 * - 1：质量极好
 * - 2：主观感觉和极好差不多，但码率可能略低于极好
 * - 3：主观感受有瑕疵但不影响沟通
 * - 4：勉强能沟通但不顺畅
 * - 5：网络质量非常差，基本不能沟通
 * - 6：网络连接已断开，完全无法沟通
 */
/**
 * Network quality types:
 *
 * - 0: The network quality is unknown.
 * - 1: The network quality is excellent.
 * - 2: The network quality is quite good, but the bitrate may be slightly lower than excellent.
 * - 3: Users can feel the communication slightly impaired.
 * - 4: Users cannot communicate smoothly.
 * - 5: The network is so bad that users can barely communicate.
 * - 6: The network is down and users cannot communicate at all.
 */
export type AgoraNetworkQuality =
  | 0 // unknown
  | 1 // excellent
  | 2 // good
  | 3 // poor
  | 4 // bad
  | 5 // very bad
  | 6; // down

/** @zh-cn
 * 用户角色类型：
 * - 1：主播
 * - 2：观众
 */
/**
 * Client roles in a live broadcast.
 *
 * - 1: Host
 * - 2: Audience
 * */
export type ClientRoleType = 1 | 2;

/** @zh-cn
 * 视频流类型：
 * - 0：视频大流，即高分辨率、高码率视频流
 * - 1：视频小流，即低分辨率、低码率视频流
 */
/** Video stream types.
 *
 * - 0: High-stream video
 * - 1: Low-stream video
 */
export type StreamType = 0 | 1;

/** @zh-cn
 * 媒体设备类型：
 * - -1：未知的设备类型
 * - 0：音频播放设备
 * - 1：音频录制设备
 * - 2：视频渲染设备
 * - 3：视频采集设备
 * - 4：应用的音频播放设备
 */
export type MediaDeviceType =
  | -1 // Unknown device type
  | 0 // Audio playback device
  | 1 // Audio recording device
  | 2 // Video renderer
  | 3 // Video capturer
  | 4; // Application audio playback device

/** @zh-cn
 * TranscodingUser 类。
 */
/**
 * The TranscodingUser class.
 */
export interface TranscodingUser {
  /** @zh-cn旁路推流的主播用户 ID。 */
  /** User ID of the user displaying the video in the CDN live. */
  uid: number;
  /** @zh-cn直播视频上用户视频在布局中的横坐标绝对值。 */
  /** Horizontal position from the top left corner of the video frame. */
  x: number;
  /** @zh-cn直播视频上用户视频在布局中的纵坐标绝对值。 */
  /** Vertical position from the top left corner of the video frame. */
  y: number;
  /** @zh-cn直播视频上用户视频的宽度，默认值为 360。 */
  /** Width of the video frame. The default value is 360. */
  width: number;
  /** @zh-cn直播视频上用户视频的高度，默认值为 640。 */
  /** Height of the video frame. The default value is 640. */
  height: number;
  /** @zh-cn
   * 直播视频上用户视频帧的图层编号。取值范围为 [0, 100] 中的整型：
   * - 最小值为 0（默认值），表示该区域图像位于最下层
   * - 最大值为 100，表示该区域图像位于最上层
   */
  /** Layer position of the video frame. The value ranges between 0 and 100.
   *
   * - 0: (Default) Lowest
   * - 100: Highest
   */
  zOrder: number;
  /** @zh-cn直播视频上用户视频的透明度。取值范围为 [0.0, 1.0]。0.0 表示该区域图像完全透明，而 1.0 表示该区域图像完全不透明。默认值为 1.0。 */
  /**  Transparency of the video frame in CDN live. The value ranges between 0.0 and 1.0:
   *
   * - 0.0: Completely transparent
   * - 1.0: (Default) Opaque
   */
  alpha: number;
  /** @zh-cn
   * 直播音频所在声道。取值范围为 [0, 5]，默认值为 0。选项不为 0 时，需要特殊的播放器支持。
   * - 0：（推荐）默认混音设置，最多支持双声道，与主播端上行音频相关
   * - 1：对应主播的音频，推流中位于 FL 声道。如果主播上行为双声道，会先把多声道混音成单声道
   * - 2：对应主播的音频，推流中位于 FC 声道。如果主播上行为双声道，会先把多声道混音成单声道
   * - 3：对应主播的音频，推流中位于 FR 声道。如果主播上行为双声道，会先把多声道混音成单声道
   * - 4：对应主播的音频，推流中位于 BL 声道。如果主播上行为双声道，会先把多声道混音成单声道
   * - 5：对应主播的音频，推流中位于 BR 声道。如果主播上行为双声道，会先把多声道混音成单声道
   */
  /** The audio channel of the sound. The default value is 0:
   * - 0: (Default) Supports dual channels at most, depending on the upstream of the broadcaster.
   * - 1: The audio stream of the broadcaster uses the FL audio channel. If the upstream of the broadcaster uses multiple audio channels, these channels will be mixed into mono first.
   * - 2: The audio stream of the broadcaster uses the FC audio channel. If the upstream of the broadcaster uses multiple audio channels, these channels will be mixed into mono first.
   * - 3: The audio stream of the broadcaster uses the FR audio channel. If the upstream of the broadcaster uses multiple audio channels, these channels will be mixed into mono first.
   * - 4: The audio stream of the broadcaster uses the BL audio channel. If the upstream of the broadcaster uses multiple audio channels, these channels will be mixed into mono first.
   * - 5: The audio stream of the broadcaster uses the BR audio channel. If the upstream of the broadcaster uses multiple audio channels, these channels will be mixed into mono first.
   */
  audioChannel: number;
}

/** @zh-cn
 * 直播转码的相关配置。
 */
/** Sets the CDN live audio/video transcoding settings. */
export interface TranscodingConfig {
  /** @zh-cn用于旁路直播的输出视频的总宽度，默认值为 360。width × height 的最小值为 16 × 16。*/
  /** Width of the video. The default value is 360. The minimum value of width × height is 16 × 16. */
  width: number;
  /** @zh-cn用于旁路直播的输出视频的总高度，默认值为 640。width × height 的最小值为 16 × 16。*/
  /** Height of the video. The default value is 640. The minimum value of width × height is 16 × 16. */
  height: number;
  /** @zh-cn用于旁路直播的输出视频的码率，单位为 Kbps，默认值为 400 Kbps。用户可以根据码率参考表中的码率值进行设置；如果设置的码率超出合理范围，Agora 服务器会在合理区间内自动调整码率值。 */
  /** Bitrate of the CDN live output video stream. The default value is 400 Kbps.
   * Set this parameter according to the Video Bitrate Table.
   * If you set a bitrate beyond the proper range, the SDK automatically adapts it to a value within the range. */
  videoBitrate: number;
  /** @zh-cn用于旁路直播的输出视频的帧率，单位为帧每秒，取值范围为 [15, 30]，默认值为 15 fps。服务器会将低于 15 的帧率设置改为 15，将高于 30 的帧率设置改为 30。*/
  /** Frame rate of the output video stream set for the CDN live broadcast. The default value is 15 fps.
   *
   * **Note**: Agora adjusts all values over 30 to 30.
   */
  videoFrameRate: number;
  /** @zh-cn
   * 是否启用低延时模式：
   * - true：低延时，不保证画质
   * - false：（默认值）高延时，保证画质
   */
  /**
   * Latency mode:
   *
   * - true: Low latency with unassured quality
   * - false: (Default) High latency with assured quality
   */
  lowLatency: boolean;
  /** @zh-cn用于旁路直播的输出视频的 GOP，单位为帧。默认值为 30 帧。*/
  /**
   * Video GOP in frames. The default value is 30 fps.
   */
  videoGop: number;
  /** @zh-cn
   * 用于旁路直播的输出视频的编解码规格。可以设置为 BASELINE、MAIN 或 HIGH；如果设置其他值，服务端会统一设为默认值 HIGH。
   * - VIDEO_CODEC_PROFILE_BASELINE = 66：Baseline 级别的视频编码规格，一般用于视频通话、手机视频等。
   * - VIDEO_CODEC_PROFILE_MAIN = 77：Main 级别的视频编码规格，一般用于主流消费类电子产品，如 mp4、便携的视频播放器、PSP 和 iPad 等
   * - VIDEO_CODEC_PROFILE_HIGH = 100：（默认）High 级别的视频编码规格，一般用于广播及视频碟片存储，高清电视
   */
  /** Self-defined video codec profile.
   *
   * - VIDEO_CODEC_PROFILE_BASELINE = 66: Baseline video codec profile. Generally used in video calls on mobile phones.
   * - VIDEO_CODEC_PROFILE_MAIN = 77: Main video codec profile. Generally used in mainstream electronics.
   * such as MP4 players, portable video players, PSP, and iPads.
   * - VIDEO_CODEC_PROFILE_HIGH = 100: (Default) High video codec profile. Generally used in high-resolution broadcasts or television.
   */
  videoCodecProfile: number;
  /** @zh-cn
   * 设置旁路直播的背景颜色。格式为 RGB 定义下的 Hex 值，不要带 # 号，如 0xC0C0C0。
   * 颜色对应的 Hex 值 = (A & 0xff) << 24 | (R & 0xff) << 16 | (G & 0xff) << 8 | (B & 0xff)
   */
  /** RGB hex value.
   *
   * Background color of the output video stream for the CDN live broadcast defined as int color
   * = (A & 0xff) << 24 | (R & 0xff) << 16 | (G & 0xff) << 8 | (B & 0xff)
   *
   * **Note**: Value only, do not include a #. For example, 0xC0C0C0.
   */
  backgroundColor: number;
  /** @zh-cn获取旁路直播中的用户人数。*/
  /** The number of users in the live broadcast. */
  userCount: number;
  /** @zh-cn
   * 用于旁路直播的输出音频的采样率：
   * - AUDIO_SAMPLE_RATE_32000 = 32000
   * - AUDIO_SAMPLE_RATE_44100 = 44100（默认）
   * - AUDIO_SAMPLE_RATE_48000 = 48000
   */
  /** Self-defined audio-sample rate:
   *
   * - AUDIO_SAMPLE_RATE_32000 = 32000
   * - AUDIO_SAMPLE_RATE_44100 = 44100 (default)
   * - AUDIO_SAMPLE_RATE_48000 = 48000
   */
  audioSampleRate: number;
  /** @zh-cn
   * 用于旁路直播的输出音频的声道数，取值范围为 [1, 5] 中的整型，默认值为 1。建议取 1 或 2，其余三个选项需要特殊播放器支持：
   * - 1：单声道
   * - 2：双声道
   * - 3：三声道
   * - 4：四声道
   * - 5：五声道
   */
  /** Agora's self-defined audio-channel types. We recommend choosing option 1 or 2.
   * A special player is required if you choose option 3, 4, or 5:
   *
   * - 1: (Default) Mono
   * - 2: Two-channel stereo
   * - 3: Three-channel stereo
   * - 4: Four-channel stereo
   * - 5: Five-channel stereo
   */
  audioChannels: number;
  /** @zh-cn直播视频上的水印图片。 */
  /** The watermark image added to the CDN live publishing stream. */
  watermark: {
    /** @zh-cn直播视频上图片的 HTTP/HTTPS 地址，字符长度不得超过 1024 字节。 */
    /** HTTP/HTTPS URL address of the image on the broadcasting video.
     * The maximum length of this parameter is 1024 bytes. */
    url: string;
    /** @zh-cn图片左上角在视频帧上的横轴坐标。*/
    /** Horizontal position of the image from the upper left of the broadcasting video. */
    x: number;
    /** @zh-cn图片左上角在视频帧上的纵轴坐标。*/
    /** Vertical position of the image from the upper left of the broadcasting video. */
    y: number;
    /** @zh-cn图片在视频帧上的宽度。*/
    /** Width of the image on the broadcasting video. */
    width: number;
    /** @zh-cn图片在视频帧上的高度。*/
    /** Height of the image on the broadcasting video. */
    height: number;
  };
  /** @zh-cnTranscodingUser 类。 */
  /** The TranscodingUsers Array. */
  transcodingUsers: Array<TranscodingUser>;
}
/** @zh-cn
 * Last-mile 网络质量探测配置。
 */
/**
 * Configurations of the last-mile network probe test.
 */
export interface LastmileProbeConfig {
  /** @zh-cn
   * 是否探测上行网络。有些用户，如直播频道中的普通观众，不需要进行网络探测：
   * - true：探测
   * - false：不探测
   */
  /**
   * Sets whether or not to test the uplink network. Some users, for example, the audience in a Live-broadcast channel,
   * do not need such a test:
   *
   * - true: test
   * - false: do not test
   */
  probeUplink: boolean;
  /** @zh-cn
   * 是否探测下行网络：
   * - true：探测
   * - false：不探测
   */
  /**
   * Sets whether or not to test the downlink network:
   *
   * - true: test
   * - false: do not test
   */
  probeDownlink: boolean;
  /** @zh-cn
   * 用户期望的最高发送码率，单位为 Kbps，范围为 [100, 5000]。
   */
  /**
   * The expected maximum sending bitrate (Kbps) of the local user. The value ranges between 100 and 5000.
   */
  expectedUplinkBitrate: number;
  /** @zh-cn
   * 用户期望的最高接收码率，单位为 Kbps，范围为 [100, 5000]。
   */
  /**
   * The expected maximum receiving bitrate (Kbps) of the local user. The value ranges between 100 and 5000.
   */
  expectedDownlinkBitrate: number;
}
/** @zh-cn
 * 单向 Last-mile 质量探测结果。
 */
/** The one-way last-mile probe result. */
export interface LastmileProbeOneWayResult {
  /** @zh-cn丢包率。*/
  /** The packet loss rate (%). */
  packetLossRate: number;
  /** @zh-cn网络抖动，单位为毫秒。*/
  /** The network jitter (ms). */
  jitter: number;
  /** @zh-cn可用网络带宽预计，单位为 Kbps。*/
  /** The estimated available bandwidth (Kbps). */
  availableBandwidth: number;
}
/** @zh-cn
 * 上下行 Last-mile 质量探测结果。
 */
/** The uplink and downlink last-mile network probe test result. */
export interface LastmileProbeResult {
  /** @zh-cn
   * Last-mile 质量探测结果的状态，有如下几种：
   * - 1：表示本次 Last-mile 质量探测是完整的
   * - 2：表示本次 Last-mile 质量探测未进行带宽预测，因此结果不完整。一个可能的原因是测试资源暂时受限
   * - 3：未进行 Last-mile 质量探测。一个可能的原因是网络连接中断
   */
  /** States of the last-mile network probe test:
   *
   * - 1: The last-mile network probe test is complete
   * - 2: The last-mile network probe test is incomplete and the bandwidth estimation is not available,
   * probably due to limited test resources
   * - 3: The last-mile network probe test is not carried out, probably due to poor network conditions
   */
  state: number;
  /** @zh-cn
   * 上行网络质量报告，详见 {@link LastmileProbeOneWayResult}。
   */
  /** The uplink last-mile network probe test result. See {@link LastmileProbeOneWayResult}. */
  uplinkReport: LastmileProbeOneWayResult;
  /** @zh-cn
   * 下行网络质量报告，详见 {@link LastmileProbeOneWayResult}。
   */
  /** The downlink last-mile network probe test result. See {@link LastmileProbeOneWayResult}. */
  downlinkReport: LastmileProbeOneWayResult;
  /** @zh-cn
   * 往返时延，单位为毫秒。
   */
  /** The round-trip delay time (ms). */
  rtt: number;
}

/** @zh-cn
 * UserInfo 对象。
 */
/** The user information. */
export interface UserInfo {
  /** @zh-cn
   * 用户 ID。
   */
   /** The user ID. */
  uid: number;
  /** @zh-cn
   * 用户 User account。
   */
  /** The user account. The maximum length of this parameter is 255 bytes.
   * Ensure that you set this parameter and do not set it as null. */
  userAccount: string;
}
/** @zh-cn本地语音的变声效果选项。 */
/** Sets the local voice changer option. */
export enum VoiceChangerPreset {
  /** @zh-cn0：原声，即关闭本地语音变声。 */
  /** 0: The original voice (no local voice change). */
  VOICE_CHANGER_OFF = 0,
  /** @zh-cn1：老男孩。 */
  /** 1: An old man's voice. */
  VOICE_CHANGER_OLDMAN = 1,
  /** @zh-cn2：小男孩。 */
  /** 2: A little boy's voice. */
  VOICE_CHANGER_BABYBOY = 2,
  /** @zh-cn3：小女孩。 */
  /** 3: A little girl's voice. */
  VOICE_CHANGER_BABYGIRL = 3,
  /** @zh-cn4：猪八戒。 */
  /** 4: The voice of a growling bear. */
  VOICE_CHANGER_ZHUBAJIE = 4,
  /** @zh-cn5：空灵。 */
  /** 5: Ethereal vocal effects. */
  VOICE_CHANGER_ETHEREAL = 5,
  /** @zh-cn6：绿巨人。 */
  /** 6: Hulk's voice. */
  VOICE_CHANGER_HULK = 6
}
/** @zh-cn
 * 预设的本地语音混响效果选项：
 */
/**
 * Sets the local voice changer option.
 */
export enum AudioReverbPreset {
  /** @zh-cn0：原声，即关闭本地语音混响。 */
  /** 0: The original voice (no local voice reverberation). */
  AUDIO_REVERB_OFF = 0, // Turn off audio reverb
  /** @zh-cn1：流行。 */
  /** 1: Pop music. */
  AUDIO_REVERB_POPULAR = 1,
  /** @zh-cn2：R&B。 */
  /** 2: R&B. */
  AUDIO_REVERB_RNB = 2,
  /** @zh-cn3：摇滚。 */
  /** 3: Rock music. */
  AUDIO_REVERB_ROCK = 3,
  /** @zh-cn4：嘻哈。 */
  /** 4: Hip-hop. */
  AUDIO_REVERB_HIPHOP = 4,
  /** @zh-cn5：演唱会。 */
  /** 5: Pop concert. */
  AUDIO_REVERB_VOCAL_CONCERT = 5,
  /** @zh-cn6：KTV。 */
  /** 6: Karaoke. */
  AUDIO_REVERB_KTV = 6,
  /** @zh-cn7：录音棚。 */
  /** 7: Recording studio. */
  AUDIO_REVERB_STUDIO = 7
}
/** @zh-cn
 * 外部导入音视频流定义。
 */
/**
 * Configuration of the imported live broadcast voice or video stream.
 */
export interface InjectStreamConfig {
  /** @zh-cn添加进入直播的外部视频源宽度。默认值为 0，即保留视频源原始宽度。 */
  /** Width of the added stream in the live broadcast. The default value is 0 (same width as the original stream). */
  width: number;
  /** @zh-cn添加进入直播的外部视频源高度。默认值为 0，即保留视频源原始高度。 */
  /** Height of the added stream in the live broadcast. The default value is 0 (same height as the original stream). */
  height: number;
  /** @zh-cn添加进入直播的外部视频源码率。默认设置为 400 Kbps。 */
  /** Video bitrate of the added stream in the live broadcast. The default value is 400 Kbps. */
  videoBitrate: number;
  /** @zh-cn添加进入直播的外部视频源帧率。默认值为 15 fps。 */
  /** Video frame rate of the added stream in the live broadcast. The default value is 15 fps. */
  videoFrameRate: number;
  /** @zh-cn添加进入直播的外部视频源 GOP。默认值为 30 帧。 */
  /** Video GOP of the added stream in the live broadcast in frames. The default value is 30 fps. */
  videoGop: number;
  /** @zh-cn
   * 添加进入直播的外部音频采样率。默认值为 44100。
   * **Note**：声网建议目前采用默认值，不要自行设置。
   * - AUDIO_SAMPLE_RATE_32000 = 32000
   * - AUDIO_SAMPLE_RATE_44100 = 44100（默认）
   * - AUDIO_SAMPLE_RATE_48000 = 48000
   */
  /**
   * Audio-sampling rate of the added stream in the live broadcast. The default value is 44100 Hz.
   * **Note**: Agora recommends setting the default value.
   * - AUDIO_SAMPLE_RATE_32000 = 32000
   * - AUDIO_SAMPLE_RATE_44100 = 44100(default)
   * - AUDIO_SAMPLE_RATE_48000 = 48000
   */
  audioSampleRate: number;
  /** @zh-cn
   * 添加进入直播的外部音频码率。单位为 Kbps，默认值为 48。
   * **Note**：声网建议目前采用默认值，不要自行设置。
   */
  /**
   * Audio bitrate of the added stream in the live broadcast. The default value is 48.
   * **Note**: Agora recommends setting the default value.
   */
  audioBitrate: number;
  /** @zh-cn
   * **Note**：添加进入直播的外部音频频道数。取值范围 [1, 2]，默认值为 1。
   * - 1：单声道（默认）
   * - 2：双声道立体声
   */
  /** Audio channels in the live broadcast.
   * - 1: (Default) Mono
   * - 2: Two-channel stereo
   * **Note**: Agora recommends setting the default value.
   */
  audioChannels: number;
}
/** @zh-cn
 * 远端用户媒体流的优先级。
 */
/**
 * Prioritizes a remote user's stream.
 */
export enum Priority {
  /** @zh-cn50：用户媒体流的优先级为高。 */
  /** 50: The user's priority is high. */
  PRIORITY_HIGH = 50,
  /** @zh-cn100：（默认）用户媒体流的优先级正常。 */
  /** 100: (Default) The user's priority is normal. */
  PRIORITY_NORMAL = 100
}
/** @zh-cn
 * 通话相关的统计信息。
 */
/**
 * Statistics of the channel.
 */
export interface RtcStats {
  /** @zh-cn通话时长，单位为秒，累计值。*/
  /** Call duration (s), represented by an aggregate value. */
  duration: number;
  /** @zh-cn发送字节数（bytes），累计值。*/
  /** Total number of bytes transmitted, represented by an aggregate value. */
  txBytes: number;
  /** @zh-cn接收字节数（bytes），累计值。*/
  /** Total number of bytes received, represented by an aggregate value. */
  rxBytes: number;
  /** @zh-cn发送码率（Kbps），瞬时值。*/
  /** Transmission bitrate (Kbps), represented by an instantaneous value. */
  txKBitRate: number;
  /** @zh-cn接收码率（Kbps），瞬时值。*/
  /** Receive bitrate (Kbps), represented by an instantaneous value. */
  rxKBitRate: number;
  /** @zh-cn音频接收码率（Kbps），瞬时值。*/
  /** Audio receive bitrate (Kbps), represented by an instantaneous value. */
  rxAudioKBitRate: number;
  /** @zh-cn音频包的发送码率（Kbps），瞬时值。*/
  /** Audio transmission bitrate (Kbps), represented by an instantaneous value. */
  txAudioKBitRate: number;
  /** @zh-cn视频接收码率（Kbps），瞬时值。*/
  /** Video receive bitrate (Kbps), represented by an instantaneous value. */
  rxVideoKBitRate: number;
  /** @zh-cn视频发送码率（Kbps），瞬时值。*/
  /** Video transmission bitrate (Kbps), represented by an instantaneous value. */
  txVideoKBitRate: number;
  /** @zh-cn当前频道内的人数。*/
  /** Number of users in the channel. */
  userCount: number;
  /** @zh-cn当前系统的 CPU 使用率 (%)。*/
  /** Application CPU usage (%). */
  cpuAppUsage: number;
  /** @zh-cn当前 App 的 CPU 使用率 (%)。*/
  /** Application CPU usage (%). */
  cpuTotalUsage: number;
}
/** @zh-cn
 * 本地视频自适应情况：
 */
/** Quality change of the local video. */
export enum QualityAdaptIndication {
  /** @zh-cn0：本地视频质量不变。 */
  /** 0: The quality of the local video stays the same. */
  ADAPT_NONE = 0,
  /** @zh-cn1：因网络带宽增加，本地视频质量改善。 */
  /** 1: The quality improves because the network bandwidth increases. */
  ADAPT_UP_BANDWIDTH = 1,
  /** @zh-cn2：因网络带宽减少，本地视频质量变差。 */
  /** 2: The quality worsens because the network bandwidth decreases. */
  ADAPT_DOWN_BANDWIDTH = 2,
}
/** @zh-cn
 * 本地视频相关的统计信息。
 */
/** Statistics of the local video. */
export interface LocalVideoStats {
  /** @zh-cn
   * （上次统计后）发送的码率，单位为 Kbps。
   */
  /** Bitrate (Kbps) sent since the last count. */
  sentBitrate: number;
  /** @zh-cn
   * 上次统计后）发送的帧率，单位为 fps。
   */
  /** Frame rate (fps) sent since the last count. */
  sentFrameRate: number;
  /** @zh-cn本地编码器的输出帧率，单位为 fps。*/
  /** The encoder output frame rate (fps) of the local video. */
  encoderOutputFrameRate: number;
  /** @zh-cn本地渲染器的输出帧率，单位为 fps。*/
  /** The renderer output frame rate (fps) of the local video. */
  rendererOutputFrameRate: number;
  /** @zh-cn本地渲染器的输出帧率，单位为 fps。
   * 当前编码器的目标编码码率，单位为 Kbps，该码率为 SDK 根据当前网络状况预估的一个值。
   */
  /** The target bitrate (Kbps) of the current encoder. This value is estimated by the SDK
   * based on the current network conditions.
   */
  targetBitrate: number;
  /** @zh-cn
   * 当前编码器的目标编码帧率，单位为 fps。
   */
  /** The target frame rate (fps) of the current encoder. */
  targetFrameRate: number;
  /** @zh-cn
   * 自上次统计后本地视频质量的自适应情况（基于目标帧率和目标码率）。详见 {@link QualityAdaptIndication}。
   */
  /** Quality change of the local video in terms of target frame rate and target bit rate
   * since last count. See {@link QualityAdaptIndication}.
   */
  qualityAdaptIndication: QualityAdaptIndication;
}
/** @zh-ch
 * 视频编码属性定义。
 */
/** VideoEncoderConfiguration */
export interface VideoEncoderConfiguration {
  /** @zh-cn
   * 视频帧在横轴上的像素。
   */
  /** Width (pixels) of the video. */
  width: number;
  /** @zh-cn
   * 视频帧在纵轴上的像素。
   */
  /** Height (pixels) of the video. */
  height: number;
  /** @zh-cn
   * 视频编码的帧率（fps）。建议不要超过 30 帧。
   */
  /**
   * The frame rate of the video. Note that we do not recommend setting this to a value greater than 30.
   */
  frameRate: number;
  /** @zh-cn
   * 最低视频编码帧率，单位为 fps。默认值为 -1。
   */
  /**
   * The minimum frame rate of the video. The default value is -1.
   */
  minFrameRate: number;
  /** @zh-cn
   * 视频编码的码率，单位为 Kbps。你可以根据场景需要，参考下面的视频基准码率参考表，手动设置你想要的码率。若设置的视频码率超出合理范围，SDK 会自动按照合理区间处理码率。
   * 你也可以选择如下一种模式：
   * - 0：（推荐）标准码率模式。该模式下，通信码率与基准码率一致；直播码率对照基准码率翻倍
   * - 1：适配码率模式。该模式下，视频在通信和直播模式下的码率与基准码率一致。
   *
   * **视频码率参考表**
   * <table>
   *     <tr>
   *         <th>分辨率</th>
   *         <th>帧率（fps）</th>
   *         <th>基准码率（通信场景）（Kbps）</th>
   *         <th>直播码率（直播场景）（Kbps）</th>
   *     </tr>
   *     <tr>
   *         <td>160 &times; 120</td>
   *         <td>15</td>
   *         <td>65</td>
   *         <td>130</td>
   *     </tr>
   *     <tr>
   *         <td>120 &times; 120</td>
   *         <td>15</td>
   *         <td>50</td>
   *         <td>100</td>
   *     </tr>
   *     <tr>
   *         <td>320 &times; 180</td>
   *         <td>15</td>
   *         <td>140</td>
   *         <td>280</td>
   *     </tr>
   *     <tr>
   *         <td>180 &times; 180</td>
   *         <td>15</td>
   *         <td>100</td>
   *         <td>200</td>
   *     </tr>
   *     <tr>
   *         <td>240 &times; 180</td>
   *         <td>15</td>
   *         <td>120</td>
   *         <td>240</td>
   *     </tr>
   *     <tr>
   *         <td>320 &times; 240</td>
   *         <td>15</td>
   *         <td>200</td>
   *         <td>400</td>
   *     </tr>
   *     <tr>
   *         <td>240 &times; 240</td>
   *         <td>15</td>
   *         <td>140</td>
   *         <td>280</td>
   *     </tr>
   *     <tr>
   *         <td>424 &times; 240</td>
   *         <td>15</td>
   *         <td>220</td>
   *         <td>440</td>
   *     </tr>
   *     <tr>
   *         <td>640 &times; 360</td>
   *         <td>15</td>
   *         <td>400</td>
   *         <td>800</td>
   *     </tr>
   *     <tr>
   *         <td>360 &times; 360</td>
   *         <td>15</td>
   *         <td>260</td>
   *         <td>520</td>
   *     </tr>
   *     <tr>
   *         <td>640 &times; 360</td>
   *         <td>30</td>
   *         <td>600</td>
   *         <td>1200</td>
   *     </tr>
   *     <tr>
   *         <td>360 &times; 360</td>
   *         <td>30</td>
   *         <td>400</td>
   *         <td>800</td>
   *     </tr>
   *     <tr>
   *         <td>480 &times; 360</td>
   *         <td>15</td>
   *         <td>320</td>
   *         <td>640</td>
   *     </tr>
   *     <tr>
   *         <td>480 &times; 360</td>
   *         <td>30</td>
   *         <td>490</td>
   *         <td>980</td>
   *     </tr>
   *     <tr>
   *         <td>640 &times; 480</td>
   *         <td>15</td>
   *         <td>500</td>
   *         <td>1000</td>
   *     </tr>
   *     <tr>
   *         <td>480 &times; 480</td>
   *         <td>15</td>
   *         <td>400</td>
   *         <td>800</td>
   *     </tr>
   *     <tr>
   *         <td>640 &times; 480</td>
   *         <td>30</td>
   *         <td>750</td>
   *         <td>1500</td>
   *     </tr>
   *     <tr>
   *         <td>480 &times; 480</td>
   *         <td>30</td>
   *         <td>600</td>
   *         <td>1200</td>
   *     </tr>
   *     <tr>
   *         <td>848 &times; 480</td>
   *         <td>15</td>
   *         <td>610</td>
   *         <td>1220</td>
   *     </tr>
   *     <tr>
   *         <td>848 &times; 480</td>
   *         <td>30</td>
   *         <td>930</td>
   *         <td>1860</td>
   *     </tr>
   *     <tr>
   *         <td>640 &times; 480</td>
   *         <td>10</td>
   *         <td>400</td>
   *         <td>800</td>
   *     </tr>
   *     <tr>
   *         <td>1280 &times; 720</td>
   *         <td>15</td>
   *         <td>1130</td>
   *         <td>2260</td>
   *     </tr>
   *     <tr>
   *         <td>1280 &times; 720</td>
   *         <td>30</td>
   *         <td>1710</td>
   *         <td>3420</td>
   *     </tr>
   *     <tr>
   *         <td>960 &times; 720</td>
   *         <td>15</td>
   *         <td>910</td>
   *         <td>1820</td>
   *     </tr>
   *     <tr>
   *         <td>960 &times; 720</td>
   *         <td>30</td>
   *         <td>1380</td>
   *         <td>2760</td>
   *     </tr>
   * </table>
   */
   /** The video encoding bitrate (Kbps).
    * Choose one of the following options:
    *
    * - 0: (Recommended) The standard bitrate.
    *  - The Communication profile: the encoding bitrate equals the base bitrate.
    *  - The Live-broadcast profile: the encoding bitrate is twice the base bitrate.
    * - 1: The compatible bitrate: the bitrate stays the same regardless of the profile.
    *
    * The Communication profile prioritizes smoothness, while the Live-broadcast profile prioritizes video quality (requiring a higher bitrate). We recommend setting the bitrate mode as #STANDARD_BITRATE to address this difference.
    *
    * The following table lists the recommended video encoder configurations, where the base bitrate applies to the Communication profile.
    * Set your bitrate based on this table. If you set a bitrate beyond the proper range, the SDK automatically sets it to within the range.
    *
    * <table>
    *     <tr>
    *         <th>Resolution</th>
    *         <th>Frame Rate (fps)</th>
    *         <th>Base Bitrate (Kbps, for Communication)</th>
    *         <th>Live Bitrate (Kbps, for Live Broadcast)</th>
    *     </tr>
    *     <tr>
    *         <td>160 &times; 120</td>
    *         <td>15</td>
    *         <td>65</td>
    *         <td>130</td>
    *     </tr>
    *     <tr>
    *         <td>120 &times; 120</td>
    *         <td>15</td>
    *         <td>50</td>
    *         <td>100</td>
    *     </tr>
    *     <tr>
    *         <td>320 &times; 180</td>
    *         <td>15</td>
    *         <td>140</td>
    *         <td>280</td>
    *     </tr>
    *     <tr>
    *         <td>180 &times; 180</td>
    *         <td>15</td>
    *         <td>100</td>
    *         <td>200</td>
    *     </tr>
    *     <tr>
    *         <td>240 &times; 180</td>
    *         <td>15</td>
    *         <td>120</td>
    *         <td>240</td>
    *     </tr>
    *     <tr>
    *         <td>320 &times; 240</td>
    *         <td>15</td>
    *         <td>200</td>
    *         <td>400</td>
    *     </tr>
    *     <tr>
    *         <td>240 &times; 240</td>
    *         <td>15</td>
    *         <td>140</td>
    *         <td>280</td>
    *     </tr>
    *     <tr>
    *         <td>424 &times; 240</td>
    *         <td>15</td>
    *         <td>220</td>
    *         <td>440</td>
    *     </tr>
    *     <tr>
    *         <td>640 &times; 360</td>
    *         <td>15</td>
    *         <td>400</td>
    *         <td>800</td>
    *     </tr>
    *     <tr>
    *         <td>360 &times; 360</td>
    *         <td>15</td>
    *         <td>260</td>
    *         <td>520</td>
    *     </tr>
    *     <tr>
    *         <td>640 &times; 360</td>
    *         <td>30</td>
    *         <td>600</td>
    *         <td>1200</td>
    *     </tr>
    *     <tr>
    *         <td>360 &times; 360</td>
    *         <td>30</td>
    *         <td>400</td>
    *         <td>800</td>
    *     </tr>
    *     <tr>
    *         <td>480 &times; 360</td>
    *         <td>15</td>
    *         <td>320</td>
    *         <td>640</td>
    *     </tr>
    *     <tr>
    *         <td>480 &times; 360</td>
    *         <td>30</td>
    *         <td>490</td>
    *         <td>980</td>
    *     </tr>
    *     <tr>
    *         <td>640 &times; 480</td>
    *         <td>15</td>
    *         <td>500</td>
    *         <td>1000</td>
    *     </tr>
    *     <tr>
    *         <td>480 &times; 480</td>
    *         <td>15</td>
    *         <td>400</td>
    *         <td>800</td>
    *     </tr>
    *     <tr>
    *         <td>640 &times; 480</td>
    *         <td>30</td>
    *         <td>750</td>
    *         <td>1500</td>
    *     </tr>
    *     <tr>
    *         <td>480 &times; 480</td>
    *         <td>30</td>
    *         <td>600</td>
    *         <td>1200</td>
    *     </tr>
    *     <tr>
    *         <td>848 &times; 480</td>
    *         <td>15</td>
    *         <td>610</td>
    *         <td>1220</td>
    *     </tr>
    *     <tr>
    *         <td>848 &times; 480</td>
    *         <td>30</td>
    *         <td>930</td>
    *         <td>1860</td>
    *     </tr>
    *     <tr>
    *         <td>640 &times; 480</td>
    *         <td>10</td>
    *         <td>400</td>
    *         <td>800</td>
    *     </tr>
    *     <tr>
    *         <td>1280 &times; 720</td>
    *         <td>15</td>
    *         <td>1130</td>
    *         <td>2260</td>
    *     </tr>
    *     <tr>
    *         <td>1280 &times; 720</td>
    *         <td>30</td>
    *         <td>1710</td>
    *         <td>3420</td>
    *     </tr>
    *     <tr>
    *         <td>960 &times; 720</td>
    *         <td>15</td>
    *         <td>910</td>
    *         <td>1820</td>
    *     </tr>
    *     <tr>
    *         <td>960 &times; 720</td>
    *         <td>30</td>
    *         <td>1380</td>
    *         <td>2760</td>
    *     </tr>
    * </table>
    */
  bitrate: number;
  /** @zh-cn
   * 最低视频编码码率。单位为 Kbps，默认值为 -1。
   * 该参数强制视频编码器输出高质量图片。如果将参数设为高于默认值，在网络状况不佳情况下可能会导致网络丢包，并影响视频播放的流畅度。因此如非对画质有特殊需求，Agora 建议不要修改该参数的值。
   */
  /**
   * The minimum encoding bitrate (Kbps). The default value is 1. Using a value greater than the default value forces the video encoder to
   * output high-quality images but may cause more packet loss and hence sacrifice the smoothness of the video transmission. That said, unless
   * you have special requirements for image quality, Agora does not recommend changing this value.
   *
   */
  minBitrate: number;
  /** @zh-cn
   * 视频编码的旋转模式，详见 {@link OrientationMode}
   */
  /** The orientation mode. See {@link OrientationMode}.*/
  orientationMode: OrientationMode;
  /** @zh-cn
   * 带宽受限时。视频编码的降低偏好。详见 {@link DegradationPreference}。
   */
  /**
   * The video encoding degradation preference under limited bandwidth. See {@link DegradationPreference}.
   */
  degradationPreference: DegradationPreference;
}
/** @zh-cn
 * 带宽受限时的视频编码降级偏好。
 */
/** The video encoding degradation preference under limited bandwidth. */
export enum DegradationPreference {
  /** @zh-cn0：（默认）降低编码帧率以保证视频质量。 */
  /** 0: (Default) Degrade the frame rate in order to maintain the video quality. */
  MAINTAIN_QUALITY = 0,
  /** @zh-cn1：降低视频质量以保证编码帧率。 */
  /** 1: Degrade the video quality in order to maintain the frame rate. */
  MAINTAIN_FRAMERATE = 1,
  /** @zh-cn2：（预留参数，暂不支持）在编码帧率和视频质量之间保持平衡。 */
  /** 2: (For future use) Maintain a balance between the frame rate and video quality. */
  MAINTAIN_BALANCED = 2,
}
/** @zh-cn
 * 视频编码的方向模式。
 */
/** The orientation mode. */
export enum OrientationMode  {
  /** @zh-cn
   * 0：（默认）该模式下 SDK 输出的视频方向与采集到的视频方向一致。接收端会根据收到的视频旋转信息对视频进行旋转。该模式适用于接收端可以调整视频方向的场景：
   * - 如果采集的视频是横屏模式，则输出的视频也是横屏模式
   * - 如果采集的视频是竖屏模式，则输出的视频也是竖屏模式
   */
/**
 * 0: (Default) The output video always follows the orientation of the captured video, because the receiver takes the rotational information passed on from the video encoder.
 * Mainly used between Agora’s SDKs.
 * - If the captured video is in landscape mode, the output video is in landscape mode.
 * - If the captured video is in portrait mode, the output video is in portrait mode.
 */
  ORIENTATION_MODE_ADAPTIVE = 0,
  /** @zh-cn
   * 1：该模式下 SDK 固定输出风景（横屏）模式的视频。如果采集到的视频是竖屏模式，则视频编码器会对其进行裁剪。该模式适用于当接收端无法调整视频方向时，如使用 CDN 推流场景下
   */
/** 1: The output video is always in landscape mode. If the captured video is in portrait mode, the video encoder crops it to fit the output. Applies to situations where
 * the receiving end cannot process the rotational information. For example, CDN live streaming. */
  ORIENTATION_MODE_FIXED_LANDSCAPE = 1,
  /** @zh-cn
   * 2：该模式下 SDK 固定输出人像（竖屏）模式的视频，如果采集到的视频是横屏模式，则视频编码器会对其进行裁剪。该模式适用于当接收端无法调整视频方向时，如使用 CDN 推流场景下
   */
/**
 * 2: The output video is always in portrait mode. If the captured video is in landscape mode, the video encoder crops it to fit the output. Applies to situations where
 * the receiving end cannot process the rotational information. For example, CDN live streaming.
 */
  ORIENTATION_MODE_FIXED_PORTRAIT = 2,
}
/** @zh-cn
 * 远端视频相关的统计信息。
 */
/**
 * Video statistics of the remote stream.
 */
export interface RemoteVideoStats {
  /** @zh-cn
   * 用户 ID，指定是哪个用户的视频流。
   */
  /** User ID of the user sending the video streams. */
  uid: number;
  /** @zh-cn
   * @deprecated 该参数已废弃。
   *
   * 延迟，单位为毫秒。
   */
  /**
   * @deprecated This parameter is deprecated.
   * Time delay (ms). */
  delay: number;
  /** @zh-cn
   * 远端视频流宽度。
   */
  /** Width (pixels) of the remote video. */
  width: number;
  /** @zh-cn
   * 远端视频流高度。
   */
  /** Height (pixels) of the remote video. */
  height: number;
  /** @zh-cn
   * 接收码率，单位为 fps。
   */
  /** Bitrate (Kbps) received since the last count. */
  receivedBitrate: number;
  /** @zh-cn
   * 远端视频解码器的输出帧率，单位为 fps。
   */
  /** The decoder output frame rate (fps) of the remote video. */
  decoderOutputFrameRate: number;
  /** @zh-cn
   * 远端视频渲染器的输出帧率，单位为 fps。
   */
  /** The renderer output frame rate (fps) of the remote video. */
  rendererOutputFrameRate: number;
  /** @zh-cn
   * 视频流类型。
   * - 0：大流
   * - 1：小流
   */
   /**
    * Video stream type:
    * - 0: High-stream
    * - 1: Low-stream
    *
    */
  rxStreamType: StreamType;
  /** @zh-cn
   * 远端用户在加入频道后发生视频卡顿的累计时长 (ms)。
   * 通话过程中，视频帧率设置不低于 5 fps 时，连续渲染的两帧视频之间间隔超过 500 ms，则记为一次视频卡顿。
   */
   /**
    * The total freeze time (ms) of the remote video stream after the remote user joins the channel.
    * In a video session where the frame rate is set to no less than 5 fps, video freeze occurs when the time interval between two adjacent renderable video frames is more than 500 ms.
    */
  totalFrozenTime: number;
  /** @zh-cn
   * 远端用户在加入频道后发生视频卡顿的累计时长占视频总有效时长的百分比 (%)。
   * 视频有效时长是指远端用户加入频道后视频未被停止发送或禁用的时长。
   */
  /**
   * The total video freeze time as a percentage (%) of the total time when the video is available.
   */
  frozenRate: number;
}
/** @zh-cn
 * 摄像头采集偏好。
 */
/** Sets the camera capturer configuration. */
export enum CaptureOutPreference {
  /** @zh-cn
   * 0：（默认）自动调整采集参数。SDK 根据实际的采集设备性能及网络情况，选择合适的摄像头输出参数，在设备性能及视频预览质量之间，维持平衡
   */
  /** 0: (Default) self-adapts the camera output parameters to the system performance and network conditions to balance CPU consumption and video preview quality.
   */
  CAPTURER_OUTPUT_PREFERENCE_AUTO = 0,
  /** @zh-cn
   * 1：优先保证设备性能。SDK 根据用户在 {@link AgoraRtcEngine.setVideoEncoderConfiguration setVideoEncoderConfiguration} 中设置编码器的分辨率和帧率，选择最接近的摄像头输出参数，从而保证设备性能。在这种情况下，预览质量接近于编码器的输出质量
   */
  /** 1: Prioritizes the system performance. The SDK chooses the dimension and frame rate of the local camera capture closest to those set by \ref IRtcEngine::setVideoEncoderConfiguration "setVideoEncoderConfiguration".
   */
  CAPTURER_OUTPUT_PREFERENCE_PERFORMANCE = 1,
  /** @zh-cn
   * 2：优先保证视频预览质量。SDK 选择较高的摄像头输出参数，从而提高预览视频的质量。在这种情况下，会消耗更多的 CPU 及内存做视频前处理
   */
  /** 2: Prioritizes the local preview quality. The SDK chooses higher camera output parameters to improve the local video preview quality. This option requires extra CPU and RAM usage for video pre-processing.
   */
  CAPTURER_OUTPUT_PREFERENCE_PREVIEW = 2
}
/** @zh-cn
 * 摄像头采集偏好设置。
 */
/** Camera capturer configuration. */
export interface CameraCapturerConfiguration {
  /** @zh-cn
   * 摄像头采集输出偏好设置。
   */
  /** The output configuration of camera capturer. */
  preference: CaptureOutPreference;
}
/** @zh-cn
 * 待共享区域相对于整个屏幕或窗口的位置，如不填，则表示共享这个屏幕或窗口。
 */
/** The relative location of the region to the screen or window. */
export interface Rectangle {
  /** @zh-cn
   * 左上角的横向偏移。
   */
  /** The horizontal offset from the top-left corner. */
  x: number; // The horizontal offset from the top-left corner.
  /** @zh-cn
   * 左上角的纵向偏移。
   */
  /** The vertical offset from the top-left corner. */
  y: number; // The vertical offset from the top-left corner.
  /** @zh-cn
   * 待共享区域的宽。
   */
  /** The width of the region. */
  width: number; // The width of the region.
  /** @zh-cn
   * 待共享区域的高。
   */
  /** The height of the region. */
  height: number; // The height of the region.
}

export type ScreenSymbol = MacScreenSymbol | WindowsScreenSymbol;

export type MacScreenSymbol = number;

export type WindowsScreenSymbol = Rectangle;

export type CaptureRect = Rectangle;

/** @zh-cn
 * 屏幕共享的编码参数配置。
 */
/** Screen sharing encoding parameters. */
export interface CaptureParam {
  /** @zh-cn
   * 屏幕共享区域的宽。
   */
  /** Width (pixels) of the video. */
  width: number; // Width (pixels) of the video
  /** @zh-cn
   * 屏幕共享区域的高。
   */
  /** Height (pixels) of the video. */
  height: number; // Height (pixels) of the video
  /** @zh-cn
   * 共享视频的帧率，单位为 fps；默认值为 5，建议不要超过 15.
   */
  /** The frame rate (fps) of the shared region. The default value is 5. We do not recommend setting this to a value greater than 15. */
  frameRate: number; // The frame rate (fps) of the shared region. The default value is 5. We do not recommend setting this to a value greater than 15.
  /** @zh-cn
   * 共享视频的码率，单位为 Kbps；默认值为 0，表示 SDK 根据当前共享屏幕的分辨率计算出一个合理的值。
   */
  /**
   * The bitrate (Kbps) of the shared region.
   * The default value is 0 (the SDK works out a bitrate according to the dimensions of the current screen).
   */
  bitrate: number; //  The bitrate (Kbps) of the shared region. The default value is 0 (the SDK works out a bitrate according to the dimensions of the current screen).
}
/** @zh-cn
 * 屏幕共享的内容类型。
 */
/**
 * Content hints for screen sharing.
 */
export enum VideoContentHint {
  /** @zh-cn
   * 0：（默认）无指定的内容类型。
   */
  /**
   * 0: (Default) No content hint.
   */
  CONTENT_HINT_NONE = 0,
  /** @zh-cn
   * 1：内容类型为动画。当共享的内容是视频、电影或视频游戏时，推荐选择该内容类型。
   */
  /**
   * 1: Motion-intensive content. Choose this option if you prefer smoothness or when you are sharing a video clip, movie, or video game.
   */
  CONTENT_HINT_MOTION = 1,
  /** @zh-cn
   * 2：内容类型为细节。当共享的内容是图片或文字时，推荐选择该内容类型。
   */
  /**
   * 2: Motionless content. Choose this option if you prefer sharpness or when you are sharing a picture, PowerPoint slide, or text.
   */
  CONTENT_HINT_DETAILS = 2
}

/** @zh-cn
 * 远端视频流传输的统计信息。
 */
/**
 * Reports the transport-layer statistics of each remote video stream.
 */
export interface RemoteVideoTransportStats {
  /** @zh-cn
   * 用户 ID，指定是哪个用户/主播的视频包。
   */
  /** User ID of the remote user sending the video packet. */
  uid: number;
  /** @zh-cn
   * 视频包从发送端到接收端的延时（毫秒）。
   */
  /** Network time delay (ms) from the remote user sending the video packet to the local user. */
  delay: number;
  /** @zh-cn
   * 视频包从发送端到接收端的丢包率 (%)。
   */
  /** Packet loss rate (%) of the video packet sent from the remote user. */
  lost: number;
  /** @zh-cn
   * 远端视频包的接收码率（Kbps）。
   */
  /** Received bitrate (Kbps) of the video packet sent from the remote user. */
  rxKBitRate: number;
}
/** @zh-cn
 * 远端音频流传输的统计信息。
 */
/**
 * Reports the transport-layer statistics of each remote audio stream.
 */
export interface RemoteAudioTransportStats {
  /** @zh-cn
   * 用户 ID，指定是哪个用户/主播的音频包。
   */
  /** User ID of the remote user sending the audio packet. */
  uid: number;
  /** @zh-cn
   * 音频包从发送端到接收端的延时（毫秒）。
   */
  /** Network time delay (ms) from the remote user sending the audio packet to the local user. */
  delay: number;
  /** @zh-cn
   * 音频包从发送端到接收端的丢包率 (%)。
   */
  /** Packet loss rate (%) of the audio packet sent from the remote user. */
  lost: number;
  /** @zh-cn
   * 远端音频包的接收码率（Kbps）。
   */
  /** Received bitrate (Kbps) of the audio packet sent from the remote user. */
  rxKBitRate: number;
}
/** @zh-cn
 * 远端音频统计信息。
 */
/**
 * Reports the statistics of the remote audio.
 */
export interface RemoteAudioStats {
  /** @zh-cn用户 ID，指定是哪个用户/主播的音频流。 */
  /** User ID of the remote user sending the audio streams. */
  uid: number;
  /** @zh-cn远端用户发送的音频流质量，详见 {@link AgoraNetworkQuality}。 */
  /** Audio quality received by the user. See {@link AgoraNetworkQuality}. */
  quality: number;
  /** @zh-cn音频发送端到接收端的网络延迟。 */
  /** Network delay from the sender to the receiver. */
  networkTransportDelay: number;
  /** @zh-cn接收端网络抖动的缓冲延迟。 */
  /** Jitter buffer delay at the receiver. */
  jitterBufferDelay: number;
  /** @zh-cn该回调周期内的音频丢帧率。 */
  /** Packet loss rate in the reported interval. */
  audioLossRate: number;
  /** @zh-cn声道数。*/
  /** The number of the channels. */
  numChannels: number;
  /** @zh-cn接收流的瞬时采样率（Hz）。*/
  /** The received sample rate. */
  receivedSampleRate: number;
  /** @zh-cn接收流的瞬时码率（Kbps）。*/
  /** The received bitrate. */
  receivedBitrate: number;
  /** @zh-cn远端用户在加入频道后发生音频卡顿的累计时长 (ms)。通话过程中，音频丢帧率达到 4% 即记为一次音频卡顿。*/
  /**
   * The total freeze time (ms) of the remote audio stream after the remote user joins the channel.
   * In a session, audio freeze occurs when the audio frame loss rate reaches 4%.
   */
  totalFrozenTime: number;
  /** @zh-cn远端用户在加入频道后发生音频卡顿的累计时长占音频总有效时长的百分比 (%)。
   * 音频有效时长是指远端用户加入频道后音频未被停止发送或禁用的时长。*/
  /** The total audio freeze time as a percentage (%) of the total time when the audio is available.
   */
  frozenRate: number;
}
/** @zh-cn
 * 远端视频状态：
 * - 1：远端视频状态正常
 * - 2：远端视频卡顿，可能是由于网络条件导致
 */
/**
 * Statistics of the remote video stream.
 * - 1: running
 * - 2: frozen, usually caused by network reason
 */
export type RemoteVideoState =
  | 1
  | 2;

/** @zh-cn
 * 网络连接状态。
 *
 * 1：网络连接断开。该状态表示 SDK 处于：
 * - 调用 {@link AgoraRtcEngine.joinChannel} 加入频道前的初始化阶段
 * - 或调用 {@link AgoraRtcEngine.leaveChannel} 后的离开频道阶段
 *
 * 2：建立网络连接中。该状态表示 SDK 在调用 {@link AgoraRtcEngine.joinChannel joinChannel} 后正在与指定的频道建立连接。
 * - 如果成功加入频道，App 会收到 connectionStateChanged 回调，通知当前网络状态变成 3：网络已连接
 * - 建议连接后，SDK 还会处理媒体初始化，一切就绪后会回调 joinedChannel
 *
 * 3：网络已连接。该状态表示用户已经加入频道，可以在频道内发布或订阅媒体流。如果因网络断开或切换而导致 SDK 与频道的连接中断，SDK 会自动重连，此时 App 会收到：
 * - connectionStateChanged 回调，通知网络状态变成 4：重新建立网络连接中
 *
 * 4：重新建立网络连接中。该状态表示 SDK 之前曾加入过频道，但因网络等原因连接中断了，此时 SDK 会自动尝试重新接入频道。
 * - 如果 SDK 无法在 10 秒内重新接入频道，则 connectionLost 会被触发，SDK 会一致保留该状态，并不断尝试重新加入频道
 * - 如果 SDK 在断开连接后，20 分钟内还是没能重新加入频道，App 会收到 connectionStateChanged 回调，通知当前网络状态进入 5：网络连接失败，SDK 停止尝试重连
 *
 * 5：网络连接失败。该状态表示 SDK 已不再尝试重新加入频道，用户必须要调用 {@link AgoraRtcEngine.leaveChannel leaveChannel} 离开频道。
 * - 如果用户还想重新加入频道，则需要再次调用 {@link AgoraRtcEngine.joinChannel joinChannel}
 * - 如果 SDK 因服务器端使用 RESTful API 禁止加入频道，则 App 会收到 connectionStateChanged 回调
 */
/**
 * Connection states.
 * - 1: The SDK is disconnected from Agora's edge server.
 *  - This is the initial state before calling the {@link AgoraRtcEngine.joinChannel} method.
 *  - The SDK also enters this state when the application calls the {@link AgoraRtcEngine.leaveChannel} method.
 * - 2: The SDK is connecting to Agora's edge server. When the application calls the {@link AgoraRtcEngine.joinChannel} method, the SDK starts to establish a connection to the specified channel.
 *  - When the SDK successfully joins the channel, it triggers the connectionStateChanged callback and switches to the 3 state.
 *  - After the SDK joins the channel and when it finishes initializing the media engine, the SDK triggers the joinedChannel callback.
 * - 3: The SDK is connected to Agora's edge server and has joined a channel. You can now publish or subscribe to a media stream in the channel.If the connection to the channel is lost because, for example,
 * if the network is down or switched, the SDK automatically tries to reconnect and triggers:
 *  - The connectionStateChanged callback and switches to the 4 state.
 * - 4: The SDK keeps rejoining the channel after being disconnected from a joined channel because of network issues.
 *  - If the SDK cannot rejoin the channel within 10 seconds after being disconnected from Agora's edge server, the SDK triggers the connectionLost callback, stays in this state, and keeps rejoining the channel.
 *  - If the SDK fails to rejoin the channel 20 minutes after being disconnected from Agora's edge server, the SDK triggers the connectionStateChanged callback, switches to the 5 state, and stops rejoining the channel.
 * - 5: The SDK fails to connect to Agora's edge server or join the channel. You must call the {@link AgoraRtcEngine.leaveChannel leaveChannel} method to leave this state.
 *  - Calls the {@link AgoraRtcEngine.joinChannel joinChannel} method again to rejoin the channel.
 *  - If the SDK is banned from joining the channel by Agora's edge server (through the RESTful API), the SDK triggers connectionStateChanged callbacks.
 */
export type ConnectionState =
  | 1 // 1: The SDK is disconnected from Agora's edge server
  | 2 // 2: The SDK is connecting to Agora's edge server.
  | 3
  | 4
  | 5; // 5: The SDK fails to connect to Agora's edge server or join the channel.
  /** @zh-cn
   * 引起当前网络状态发生改变的原因：
   * - 0：建立网络连接中
   * - 1：成功加入频道
   * - 2：网络连接中断
   * - 3：网络连接被服务器禁止
   * - 4：加入频道失败。SDK 在尝试加入频道 20 分钟后还是没能加入频道，会返回该状态，并停止尝试重连
   * - 5：离开频道
   * - 6：不是有效的 APP ID。请更换有效的 APP ID 重新加入频道
   * - 7：不是有效的频道名。请更换有效的频道名重新加入频道
   * - 8：生成的 Token 无效
   * - 9：当前使用的 Token 过期，不再有效，需要重新在你的服务端申请生成 Token
   * - 10：此用户被服务器禁止
   * - 11：由于设置了代理服务器，SDK 尝试重连
   * - 12：更新 Token 引起网络连接状态改变
   * - 13：客户端 IP 地址变更，可能是由于网络类型，或网络运营商的 IP 或端口发生改变引起
   */
  /**
   * Reasons for a connection state change:
   * - 0: The SDK is connecting to Agora's edge server.
   * - 1: The SDK has joined the channel successfully.
   * - 2: The connection between the SDK and Agora's edge server is interrupted.
   * - 3: The connection between the SDK and Agora's edge server is banned by Agora's edge server.
   * - 4: The SDK fails to join the channel for more than 20 minutes and stops reconnecting to the channel.
   * - 5: The SDK has left the channel.
   * - 6: Invalid App ID.
   * - 7: Invalid Channel Name.
   * - 8: Invalid Token.
   * - 9: Token Expired.
   * - 10: This user has been banned by server.
   * - 11: SDK reconnects for setting proxy server.
   * - 12: Network status change for renew token.
   * - 13: Client IP Address changed.
   */
export type ConnectionChangeReason =
  | 0 // 0: The SDK is connecting to Agora's edge server.
  | 1 // 1: The SDK has joined the channel successfully.
  | 2 // 2: The connection between the SDK and Agora's edge server is interrupted.
  | 3 // 3: The connection between the SDK and Agora's edge server is banned by Agora's edge server.
  | 4 // 4: The SDK fails to join the channel for more than 20 minutes and stops reconnecting to the channel.
  | 5 // 5: The SDK has left the channel.
  | 6 // 6: Invalid App ID
  | 7 // 7: Invalid Channel Name
  | 8 // 8: Invalid Token
  | 9 // 9: Token Expired
  | 10 // 10: This user has been banned by server
  | 11 // 11: SDK reconnects for setting proxy server
  | 12 // 12: Network status change for renew token
  | 13; // 13: Client IP Address changed


/** @zh-cn
 * @deprecated 该枚举已废弃。
 * 视频属性。 */
/**
 * @deprecated Deprecated.
 * Video profile. */
export enum VIDEO_PROFILE_TYPE {
  /** @zh-cn0：分辨率 160 × 120，帧率 15 fps，码率 65 Kbps。 */
  /** 0: 160 &times; 120, frame rate 15 fps, bitrate 65 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_120P = 0,
  /** @zh-cn2：分辨率 120 × 120，帧率 15 fps，码率 50 Kbps。 */
  /** 2: 120 &times; 120, frame rate 15 fps, bitrate 50 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_120P_3 = 2,
  /** @zh-cn10：分辨率 320 × 180，帧率 15 fps，码率 140 Kbps。 */
  /** 10: 320&times;180, frame rate 15 fps, bitrate 140 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_180P = 10,
  /** @zh-cn12：分辨率 180 × 180，帧率 15 fps，码率 100 Kbps。 */
  /** 12: 180 &times; 180, frame rate 15 fps, bitrate 100 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_180P_3 = 12,
  /** @zh-cn13：分辨率 240 × 180，帧率 15 fps，码率 120 Kbps。 */
  /** 13: 240 &times; 180, frame rate 15 fps, bitrate 120 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_180P_4 = 13,
  /** @zh-cn20：分辨率 320 × 240，帧率 15 fps，码率 200 Kbps。 */
  /** 20: 320 &times; 240, frame rate 15 fps, bitrate 200 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_240P = 20,
  /** @zh-cn22：分辨率 240 × 240，帧率 15 fps，码率 140 Kbps。 */
  /** 22: 240 &times; 240, frame rate 15 fps, bitrate 140 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_240P_3 = 22,
  /** @zh-cn23：分辨率 424 × 240，帧率 15 fps，码率 220 Kbps。 */
  /** 23: 424 &times; 240, frame rate 15 fps, bitrate 220 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_240P_4 = 23,
  /** @zh-cn30：分辨率 640 × 360，帧率 15 fps，码率 400 Kbps。 */
  /** 30: 640 &times; 360, frame rate 15 fps, bitrate 400 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_360P = 30,
  /** @zh-cn32：分辨率 360 × 360，帧率 15 fps，码率 260 Kbps。 */
  /** 32: 360 &times; 360, frame rate 15 fps, bitrate 260 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_360P_3 = 32,
  /** @zh-cn33：分辨率 640 × 360，帧率 30 fps，码率 600 Kbps。 */
  /** 33: 640 &times; 360, frame rate 30 fps, bitrate 600 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_360P_4 = 33,
  /** @zh-cn35：分辨率 360 × 360，帧率 30 fps，码率 400 Kbps。 */
  /** 35: 360 &times; 360, frame rate 30 fps, bitrate 400 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_360P_6 = 35,
  /** @zh-cn36：分辨率 480 × 360，帧率 15 fps，码率 320 Kbps。 */
  /** 36: 480 &times; 360, frame rate 15 fps, bitrate 320 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_360P_7 = 36,
  /** @zh-cn37：分辨率 480 × 360，帧率 30 fps，码率 490 Kbps。 */
  /** 37: 480 &times; 360, frame rate 30 fps, bitrate 490 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_360P_8 = 37,
  /** @zh-cn38：分辨率 640 × 360，帧率 15 fps，码率 800 Kbps。
   * **Note**：该视频属性仅适用于直播频道模式。
   */
  /** @zh-cn38: 640 &times; 360, frame rate 15 fps, bitrate 800 Kbps.
   * **Note**: Live broadcast profile only.
   */
  VIDEO_PROFILE_LANDSCAPE_360P_9 = 38,
  /** @zh-cn39：分辨率 640 × 360，帧率 24 fps，码率 800 Kbps。
   * **Note**：该视频属性仅适用于直播频道模式。
   */
  /** @zh-cn39: 640 &times; 360, frame rate 24 fps, bitrate 800 Kbps.
   * **Note**: Live broadcast profile only.
   */
  VIDEO_PROFILE_LANDSCAPE_360P_10 = 39,
  /** @zh-cn100：分辨率 640 × 360，帧率 24 fps，码率 1000 Kbps。
   * **Note**：该视频属性仅适用于直播频道模式。
   */
  /** @zh-cn100: 640 &times; 360, frame rate 24 fps, bitrate 1000 Kbps.
   * **Note**: Live broadcast profile only.
   */
  VIDEO_PROFILE_LANDSCAPE_360P_11 = 100,
  /** @zh-cn40：分辨率 640 × 480，帧率 15 fps，码率 500 Kbps。 */
  /** 40: 640 &times; 480, frame rate 15 fps, bitrate 500 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_480P = 40,
  /** @zh-cn42：分辨率 480 × 480，帧率 15 fps，码率 400 Kbps。 */
  /** 42: 480 &times; 480, frame rate 15 fps, bitrate 400 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_480P_3 = 42,
  /** @zh-cn43：分辨率 640 × 480，帧率 30 fps，码率 750 Kbps。 */
  /** 43: 640 &times; 480, frame rate 30 fps, bitrate 750 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_480P_4 = 43,
  /** @zh-cn45：分辨率 480 × 480，帧率 30 fps，码率 600 Kbps。 */
  /** 45: 480 &times; 480, frame rate 30 fps, bitrate 600 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_480P_6 = 45,
  /** @zh-cn47：分辨率 848 × 480，帧率 15 fps，码率 610 Kbps。 */
  /** 47: 848 &times; 480, frame rate 15 fps, bitrate 610 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_480P_8 = 47,
  /** @zh-cn48：分辨率 848 × 480，帧率 30 fps，码率 930 Kbps。 */
  /** 48: 848 &times; 480, frame rate 30 fps, bitrate 930 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_480P_9 = 48,
  /** @zh-cn49：分辨率 640 × 480，帧率 10 fps，码率 400 Kbps。 */
  /** 49: 640 &times; 480, frame rate 10 fps, bitrate 400 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_480P_10 = 49,
  /** @zh-cn50：分辨率 1280 × 720，帧率 15 fps，码率 1130 Kbps。 */
  /** 50: 1280 &times; 720, frame rate 15 fps, bitrate 1130 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_720P = 50,
  /** @zh-cn52：分辨率 1280 × 720，帧率 30 fps，码率 1710 Kbps。 */
  /** 52: 1280 &times; 720, frame rate 30 fps, bitrate 1710 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_720P_3 = 52,
  /** @zh-cn54：分辨率 960 × 720，帧率 15 fps，码率 910 Kbps。 */
  /** 54: 960 &times; 720, frame rate 15 fps, bitrate 910 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_720P_5 = 54,
  /** @zh-cn55：分辨率 960 × 720，帧率 30 fps，码率 1380 Kbps。 */
  /** 55: 960 &times; 720, frame rate 30 fps, bitrate 1380 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_720P_6 = 55,
  /** @zh-cn60：分辨率 1920 × 1080，帧率 15 fps，码率 2080 Kbps。 */
  /** 60: 1920 &times; 1080, frame rate 15 fps, bitrate 2080 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_1080P = 60,
  /** @zh-cn62：分辨率 1920 × 1080，帧率 30 fps，码率 3150 Kbps。 */
  /** 62: 1920 &times; 1080, frame rate 30 fps, bitrate 3150 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_1080P_3 = 62,
  /** @zh-cn64：分辨率 1920 × 1080，帧率 60 fps，码率 4780 Kbps。 */
  /** 64: 1920 &times; 1080, frame rate 60 fps, bitrate 4780 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_1080P_5 = 64,
  /** @zh-cn66：分辨率 2560 × 1440，帧率 30 fps，码率 4850 Kbps。 */
  /** 66: 2560 &times; 1440, frame rate 30 fps, bitrate 4850 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_1440P = 66,
  /** @zh-cn67：分辨率 2560 × 1440，帧率 60 fps，码率 7350 Kbps。 */
  /** 67: 2560 &times; 1440, frame rate 60 fps, bitrate 6500 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_1440P_2 = 67,
  /** @zh-cn70：分辨率 3840 × 2160，分辨率 30 fps，码率 8910 Kbps。 */
  /** 70: 3840 &times; 2160, frame rate 30 fps, bitrate 6500 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_4K = 70,
  /** @zh-cn72：分辨率 3840 × 2160，帧率 60 fps，码率 13500 Kbps。 */
  /** 72: 3840 &times; 2160, frame rate 60 fps, bitrate 6500 Kbps. */
  VIDEO_PROFILE_LANDSCAPE_4K_3 = 72,
  /** @zh-cn1000：分辨率 120 × 160，帧率 15 fps，码率 65 Kbps。 */
  /** 1000: 120 &times; 160, frame rate 15 fps, bitrate 65 Kbps. */
  VIDEO_PROFILE_PORTRAIT_120P = 1000,
  /** @zh-cn1002：分辨率 120 × 120，帧率 15 fps，码率 50 Kbps。 */
  /** 1002: 120 &times; 120, frame rate 15 fps, bitrate 50 Kbps. */
  VIDEO_PROFILE_PORTRAIT_120P_3 = 1002,
  /** @zh-cn1010：分辨率 180 × 320，帧率 15 fps，码率 140 Kbps。 */
  /** 1010: 180 &times; 320, frame rate 15 fps, bitrate 140 Kbps. */
  VIDEO_PROFILE_PORTRAIT_180P = 1010,
  /** @zh-cn1012：分辨率 180 × 180，帧率 15 fps，码率 100 Kbps。 */
  /** 1012: 180 &times; 180, frame rate 15 fps, bitrate 100 Kbps. */
  VIDEO_PROFILE_PORTRAIT_180P_3 = 1012,
  /** @zh-cn1013：分辨率 180 × 240，帧率 15 fps，码率 120 Kbps。 */
  /** 1013: 180 &times; 240, frame rate 15 fps, bitrate 120 Kbps. */
  VIDEO_PROFILE_PORTRAIT_180P_4 = 1013,
  /** @zh-cn1020：分辨率 240 × 320，帧率 15 fps，码率 200 Kbps。 */
  /** 1020: 240 &times; 320, frame rate 15 fps, bitrate 200 Kbps. */
  VIDEO_PROFILE_PORTRAIT_240P = 1020,
  /** @zh-cn1022：分辨率 240 × 240，帧率 15 fps，码率 140 Kbps。 */
  /** 1022: 240 &times; 240, frame rate 15 fps, bitrate 140 Kbps. */
  VIDEO_PROFILE_PORTRAIT_240P_3 = 1022,
  /** @zh-cn1023：分辨率 240 × 424，帧率 15 fps，码率 220 Kbps */
  /** 1023: 240 &times; 424, frame rate 15 fps, bitrate 220 Kbps. */
  VIDEO_PROFILE_PORTRAIT_240P_4 = 1023,
  /** @zh-cn1030：分辨率 360 × 640，帧率 15 fps，码率 400 Kbps */
  /** 1030: 360 &times; 640, frame rate 15 fps, bitrate 400 Kbps. */
  VIDEO_PROFILE_PORTRAIT_360P = 1030,
  /** @zh-cn1032：分辨率 360 × 360，帧率 15 fps，码率 260 Kbps。 */
  /** 1032: 360 &times; 360, frame rate 15 fps, bitrate 260 Kbps. */
  VIDEO_PROFILE_PORTRAIT_360P_3 = 1032,
  /** @zh-cn1033：分辨率 360 × 640，帧率 30 fps，码率 600 Kbps。 */
  /** 1033: 360 &times; 640, frame rate 30 fps, bitrate 600 Kbps. */
  VIDEO_PROFILE_PORTRAIT_360P_4 = 1033,
  /** @zh-cn1035：分辨率 360 × 360，帧率 30 fps，码率 400 Kbps。 */
  /** 1035: 360 &times; 360, frame rate 30 fps, bitrate 400 Kbps. */
  VIDEO_PROFILE_PORTRAIT_360P_6 = 1035,
  /** @zh-cn1036：分辨率 360 × 480，帧率 15 fps，码率 320 Kbps。 */
  /** 1036: 360 &times; 480, frame rate 15 fps, bitrate 320 Kbps. */
  VIDEO_PROFILE_PORTRAIT_360P_7 = 1036,
  /** @zh-cn1037：分辨率 360 × 480，帧率 30 fps，码率 490 Kbps。 */
  /** 1037: 360 &times; 480, frame rate 30 fps, bitrate 490 Kbps. */
  VIDEO_PROFILE_PORTRAIT_360P_8 = 1037,
  /** @zh-cn1038：分辨率 360 × 640，帧率 15 fps，码率 800 Kbps。
   * **Note**：该视频属性仅适用于直播频道模式。
   */
  /** 1038: 360 &times; 640, frame rate 15 fps, bitrate 800 Kbps.
   * **Note**: Live broadcast profile only.
   */
  VIDEO_PROFILE_PORTRAIT_360P_9 = 1038,
  /** @zh-cn1039：分辨率 360 × 640，帧率 24 fps，码率 800 Kbps。
   * **Note**：该视频属性仅适用于直播频道模式。
   */
  /** 1039: 360 &times; 640, frame rate 24 fps, bitrate 800 Kbps.
   * **Note**: Live broadcast profile only.
   */
  VIDEO_PROFILE_PORTRAIT_360P_10 = 1039,
  /** @zh-cn1100：分辨率 360 × 640，帧率 24 fps，码率 1000 Kbps。
   * **Note**： 该视频属性仅适用于直播频道模式。
   */
  /** 1100: 360 &times; 640, frame rate 24 fps, bitrate 1000 Kbps.
   * **Note**: Live broadcast profile only.
   */
  VIDEO_PROFILE_PORTRAIT_360P_11 = 1100,
  /** @zh-cn1040：分辨率 480 × 640，帧率 15 fps，码率 500 Kbps。 */
  /** 1040: 480 &times; 640, frame rate 15 fps, bitrate 500 Kbps. */
  VIDEO_PROFILE_PORTRAIT_480P = 1040,
  /** @zh-cn1042：分辨率 480 × 480，帧率 15 fps，码率 400 Kbps。 */
  /** 1042: 480 &times; 480, frame rate 15 fps, bitrate 400 Kbps. */
  VIDEO_PROFILE_PORTRAIT_480P_3 = 1042,
  /** @zh-cn1043：分辨率 480 × 640，帧率 30 fps，码率 750 Kbps。 */
  /** 1043: 480 &times; 640, frame rate 30 fps, bitrate 750 Kbps. */
  VIDEO_PROFILE_PORTRAIT_480P_4 = 1043,
  /** @zh-cn1045：分辨率 480 × 480，帧率 30 fps，码率 600 Kbps。 */
  /** 1045: 480 &times; 480, frame rate 30 fps, bitrate 600 Kbps. */
  VIDEO_PROFILE_PORTRAIT_480P_6 = 1045,
  /** @zh-cn1047：分辨率 480 × 848，帧率 15 fps，码率 610 Kbps。 */
  /** 1047: 480 &times; 848, frame rate 15 fps, bitrate 610 Kbps. */
  VIDEO_PROFILE_PORTRAIT_480P_8 = 1047,
  /** @zh-cn1048：分辨率 480 × 848，帧率 30 fps，码率 930 Kbps。 */
  /** 1048: 480 &times; 848, frame rate 30 fps, bitrate 930 Kbps. */
  VIDEO_PROFILE_PORTRAIT_480P_9 = 1048,
  /** @zh-cn1049：分辨率 480 × 640，帧率 10 fps，码率 400 Kbps。 */
  /** 1049: 480 &times; 640, frame rate 10 fps, bitrate 400 Kbps. */
  VIDEO_PROFILE_PORTRAIT_480P_10 = 1049,
  /** @zh-cn1050：分辨率 720 × 1280，帧率 15 fps，码率 1130 Kbps。 */
  /** 1050: 720 &times; 1280, frame rate 15 fps, bitrate 1130 Kbps. */
  VIDEO_PROFILE_PORTRAIT_720P = 1050,
  /** @zh-cn1052：分辨率 720 × 1280，帧率 30 fps，码率 1710 Kbps。 */
  /** 1052: 720 &times; 1280, frame rate 30 fps, bitrate 1710 Kbps. */
  VIDEO_PROFILE_PORTRAIT_720P_3 = 1052,
  /** @zh-cn1054：分辨率 720 × 960，帧率 15 fps，码率 910 Kbps。 */
  /** 1054: 720 &times; 960, frame rate 15 fps, bitrate 910 Kbps. */
  VIDEO_PROFILE_PORTRAIT_720P_5 = 1054,
  /** @zh-cn1055：分辨率 720 × 960，帧率 30 fps，码率 1380 Kbps。 */
  /** 1055: 720 &times; 960, frame rate 30 fps, bitrate 1380 Kbps. */
  VIDEO_PROFILE_PORTRAIT_720P_6 = 1055,
  /** @zh-cn1060：分辨率 1080 × 1920，帧率 15 fps，码率 2080 Kbps。 */
  /** 1060: 1080 &times; 1920, frame rate 15 fps, bitrate 2080 Kbps. */
  VIDEO_PROFILE_PORTRAIT_1080P = 1060,
  /** @zh-cn1062：分辨率 1080 × 1920，帧率 30 fps，码率 3150 Kbps。 */
  /** 1062: 1080 &times; 1920, frame rate 30 fps, bitrate 3150 Kbps. */
  VIDEO_PROFILE_PORTRAIT_1080P_3 = 1062,
  /** @zh-cn1064：分辨率 1080 × 1920，帧率 60 fps，码率 4780 Kbps。 */
  /** 1064: 1080 &times; 1920, frame rate 60 fps, bitrate 4780 Kbps. */
  VIDEO_PROFILE_PORTRAIT_1080P_5 = 1064,
  /** @zh-cn1066：分辨率 1440 × 2560，帧率 30 fps，码率 4850 Kbps。 */
  /** 1066: 1440 &times; 2560, frame rate 30 fps, bitrate 4850 Kbps. */
  VIDEO_PROFILE_PORTRAIT_1440P = 1066,
  /** @zh-cn1067：分辨率 1440 × 2560，帧率 60 fps，码率 6500 Kbps。 */
  /** 1067: 1440 &times; 2560, frame rate 60 fps, bitrate 6500 Kbps. */
  VIDEO_PROFILE_PORTRAIT_1440P_2 = 1067,
  /** @zh-cn1070：分辨率 2160 × 3840，分辨率 30 fps，码率 6500 Kbps。 */
  /** 1070: 2160 &times; 3840, frame rate 30 fps, bitrate 6500 Kbps. */
  VIDEO_PROFILE_PORTRAIT_4K = 1070,
  /** @zh-cn1072：分辨率 2160 × 3840，帧率 60 fps，码率 6500 Kbps。 */
  /** 1072: 2160 &times; 3840, frame rate 60 fps, bitrate 6500 Kbps. */
  VIDEO_PROFILE_PORTRAIT_4K_3 = 1072,
  /** @zh-cn默认视频属性：分辨率 640 × 360，帧率 15 fps，码率 400 Kbps。 */
  /** Default 640 &times; 360, frame rate 15 fps, bitrate 400 Kbps. */
  VIDEO_PROFILE_DEFAULT = VIDEO_PROFILE_LANDSCAPE_360P
}

/**
 * interface for c++ addon (.node)
 */
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
      lighteningContrastLevel: 0 | 1 | 2; // 0 for low, 1 for normal, 2 for high
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
  setEncryptionMode(mode: string): number;
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
  registerLocalUserAccount(appId: string, userAccount: string): number;
  joinChannelWithUserAccount(token: string, channel: string, userAccount: string): number;
  getUserInfoByUserAccount(userAccount: string) : {errCode:number, userInfo: UserInfo};
  getUserInfoByUid(uid: number) : {errCode:number, userInfo: UserInfo};
  adjustRecordingSignalVolume(volume:number): number;
  adjustPlaybackSignalVolume(volume:number): number;
  stopAllEffects(): number;
}
