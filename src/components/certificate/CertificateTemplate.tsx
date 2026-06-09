import { forwardRef } from "react";

import logoImg from "@/assets/logo.png";



interface CertificateTemplateProps {

  recipientName: string;

  examName: string;

  examDescription: string | null;

  certificateNumber: string;

  issuedDate: string;

  score: number;

  totalQuestions: number;

  passThreshold: number;

}



const CertificateTemplate = forwardRef<HTMLDivElement, CertificateTemplateProps>(

  ({ recipientName, examName, examDescription, certificateNumber, issuedDate, score, totalQuestions, passThreshold }, ref) => {



    const formattedDate = new Date(issuedDate).toLocaleDateString('ka-GE', {

      day: '2-digit',

      month: '2-digit',

      year: 'numeric',

    });



    const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;



    return (

      <div ref={ref} className="cert-template" id="certificate-content" style={{

        width: '842px',

        minHeight: '595px',

        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',

        padding: '40px',

        position: 'relative',

        fontFamily: 'Georgia, serif',

        color: '#fff',

        overflow: 'hidden',

      }}>

        {/* Decorative elements */}

        <div style={{

          position: 'absolute',

          top: '0',

          left: '0',

          right: '0',

          bottom: '0',

          border: '8px solid #ffd700',

          borderRadius: '12px',

          pointerEvents: 'none',

        }} />

        <div style={{

          position: 'absolute',

          top: '20px',

          left: '20px',

          right: '20px',

          bottom: '20px',

          border: '2px solid rgba(255, 215, 0, 0.3)',

          borderRadius: '8px',

          pointerEvents: 'none',

        }} />

        {/* Corner decorations */}

        <div style={{

          position: 'absolute',

          top: '15px',

          left: '15px',

          width: '60px',

          height: '60px',

          borderTop: '4px solid #ffd700',

          borderLeft: '4px solid #ffd700',

          borderTopLeftRadius: '8px',

        }} />

        <div style={{

          position: 'absolute',

          top: '15px',

          right: '15px',

          width: '60px',

          height: '60px',

          borderTop: '4px solid #ffd700',

          borderRight: '4px solid #ffd700',

          borderTopRightRadius: '8px',

        }} />

        <div style={{

          position: 'absolute',

          bottom: '15px',

          left: '15px',

          width: '60px',

          height: '60px',

          borderBottom: '4px solid #ffd700',

          borderLeft: '4px solid #ffd700',

          borderBottomLeftRadius: '8px',

        }} />

        <div style={{

          position: 'absolute',

          bottom: '15px',

          right: '15px',

          width: '60px',

          height: '60px',

          borderBottom: '4px solid #ffd700',

          borderRight: '4px solid #ffd700',

          borderBottomRightRadius: '8px',

        }} />

        {/* Content */}

        <div style={{

          position: 'relative',

          zIndex: 1,

          textAlign: 'center',

          padding: '20px',

        }}>

          {/* Logo */}

          <div style={{

            display: 'flex',

            alignItems: 'center',

            justifyContent: 'center',

            gap: '12px',

            marginBottom: '30px',

          }}>

            <img src={logoImg} alt="CodeZero" style={{ width: '60px', height: '60px' }} />

            <span style={{

              fontSize: '28px',

              fontWeight: 'bold',

              letterSpacing: '2px',

              color: '#ffd700',

            }}>CODEZERO ACADEMY</span>

          </div>



          {/* Title */}

          <h1 style={{

            fontSize: '48px',

            fontWeight: 'bold',

            margin: '0 0 10px 0',

            textShadow: '2px 2px 4px rgba(0,0,0,0.3)',

            letterSpacing: '4px',

          }}>CERTIFICATE</h1>

          <div style={{

            fontSize: '18px',

            marginBottom: '40px',

            opacity: 0.9,

            fontStyle: 'italic',

          }}>of Achievement</div>



          {/* Recipient */}

          <div style={{

            marginBottom: '30px',

          }}>

            <div style={{

              fontSize: '16px',

              marginBottom: '8px',

              opacity: 0.8,

            }}>This certificate is proudly presented to</div>

            <div style={{

              fontSize: '36px',

              fontWeight: 'bold',

              color: '#ffd700',

              marginBottom: '15px',

              textShadow: '2px 2px 4px rgba(0,0,0,0.3)',

            }}>{recipientName}</div>

            <div style={{

              fontSize: '18px',

              lineHeight: 1.6,

            }}>

              for successfully completing the

              <span style={{

                fontWeight: 'bold',

                color: '#ffd700',

                margin: '0 8px',

              }}>{examName}</span>

              certification exam

            </div>

          </div>



          {/* Exam description */}

          {examDescription && (

            <div style={{

              maxWidth: '600px',

              margin: '0 auto 30px',

              padding: '15px',

              background: 'rgba(255,255,255,0.1)',

              borderRadius: '8px',

              fontSize: '14px',

              lineHeight: 1.5,

            }}>

              <div style={{

                fontWeight: 'bold',

                marginBottom: '8px',

                color: '#ffd700',

              }}>გამოცდა მოიცავდა:</div>

              <div>{examDescription}</div>

            </div>

          )}



          {/* Score */}

          <div style={{

            display: 'flex',

            justifyContent: 'center',

            gap: '40px',

            marginBottom: '40px',

            flexWrap: 'wrap',

          }}>

            <div style={{

              textAlign: 'center',

            }}>

              <div style={{

                fontSize: '32px',

                fontWeight: 'bold',

                color: '#ffd700',

              }}>{score}/{totalQuestions}</div>

              <div style={{

                fontSize: '12px',

                opacity: 0.8,

              }}>სწორი პასუხი</div>

            </div>

            <div style={{

              textAlign: 'center',

            }}>

              <div style={{

                fontSize: '32px',

                fontWeight: 'bold',

                color: '#ffd700',

              }}>{percentage}%</div>

              <div style={{

                fontSize: '12px',

                opacity: 0.8,

              }}>შედეგი</div>

            </div>

            <div style={{

              textAlign: 'center',

            }}>

              <div style={{

                fontSize: '32px',

                fontWeight: 'bold',

                color: '#ffd700',

              }}>{passThreshold}/{totalQuestions}</div>

              <div style={{

                fontSize: '12px',

                opacity: 0.8,

              }}>წარმატების ზღვარი</div>

            </div>

          </div>



          {/* Footer */}

          <div style={{

            display: 'flex',

            justifyContent: 'space-between',

            alignItems: 'flex-end',

            marginTop: '40px',

            paddingTop: '30px',

            borderTop: '1px solid rgba(255,255,255,0.2)',

          }}>

            <div style={{

              textAlign: 'left',

            }}>

              <div style={{

                fontSize: '18px',

                fontWeight: 'bold',

                marginBottom: '5px',

              }}>{formattedDate}</div>

              <div style={{

                fontSize: '12px',

                opacity: 0.7,

              }}>თარიღი</div>

            </div>

            <div style={{

              textAlign: 'center',

            }}>

              <div style={{

                fontSize: '14px',

                opacity: 0.7,

                marginBottom: '5px',

              }}>Certificate No.</div>

              <div style={{

                fontSize: '16px',

                fontWeight: 'bold',

                color: '#ffd700',

                fontFamily: 'monospace',

              }}>{certificateNumber}</div>

            </div>

            <div style={{

              textAlign: 'right',

            }}>

              <div style={{

                fontSize: '18px',

                fontWeight: 'bold',

                marginBottom: '5px',

              }}>CodeZero Academy</div>

              <div style={{

                fontSize: '12px',

                opacity: 0.7,

              }}>ორგანიზაცია</div>

            </div>

          </div>

        </div>

      </div>

    );

  }

);



CertificateTemplate.displayName = 'CertificateTemplate';



export default CertificateTemplate;
