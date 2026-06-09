import { forwardRef } from "react";

import logoImg from "@/assets/logo.png";

import certBg from "@/assets/certificate-bg.jpg";



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

      <div ref={ref} className="cert-template" id="certificate-content">

        <img src={certBg} alt="" className="cert-template-bg-img" />

        <div className="cert-template-bg" />



        <div className="cert-corner cert-corner-tl" />

        <div className="cert-corner cert-corner-tr" />

        <div className="cert-corner cert-corner-bl" />

        <div className="cert-corner cert-corner-br" />



        <div className="cert-template-content">

          {/* Logo */}

          <div className="cert-template-logo">

            <img src={logoImg} alt="CodeZero" className="cert-template-logo-img" />

            <span className="cert-template-logo-text">Codezero</span>

          </div>



          <h1 className="cert-template-title">CERTIFICATE</h1>



          {/* Recipient */}

          <div className="cert-template-recipient">

            <span className="cert-template-name">{recipientName}</span> has successfully completed

            <br />

            the <span className="cert-template-program">{examName}</span> certification exam

            <br />

            conducted by CodeZero Academy.

          </div>



          {/* Exam description - real info */}

          {examDescription && (

            <div className="cert-template-training">

              <div className="cert-template-training-title">

                გამოცდა მოიცავდა:

              </div>

              <div className="cert-template-training-list">

                {examDescription}

              </div>

            </div>

          )}



          {/* Real score */}

          <div className="cert-template-recognition">

            შეფასება: {score}/{totalQuestions} ({percentage}%) — წარმატების ზღვარი: {passThreshold}/{totalQuestions}

          </div>



          {/* Footer */}

          <div className="cert-template-footer">

            <div className="cert-template-sig">

              <div className="cert-template-sig-value">{formattedDate}</div>

              <div className="cert-template-sig-label">Date</div>

            </div>

            <div className="cert-template-sig">

              <div className="cert-template-sig-value">CodeZero Academy</div>

              <div className="cert-template-sig-label">Organization</div>

            </div>

          </div>



          <div className="cert-template-number">

            Certificate No. {certificateNumber}

          </div>

        </div>

      </div>

    );

  }

);



CertificateTemplate.displayName = 'CertificateTemplate';



export default CertificateTemplate;
